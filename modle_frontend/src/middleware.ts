import { NextRequest, NextResponse } from 'next/server';

// JWT payload의 exp 클레임만 디코딩해서 만료 여부 확인 (서명 검증 불필요)
function isJwtExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

// cookie 헤더 문자열에서 특정 쿠키 값을 새 값으로 교체하거나 추가
function updateCookieHeader(cookieHeader: string, name: string, value: string): string {
  const parts = cookieHeader.split(/;\s*/);
  const idx = parts.findIndex((p) => p.startsWith(`${name}=`));
  if (idx >= 0) {
    parts[idx] = `${name}=${value}`;
  } else {
    parts.push(`${name}=${value}`);
  }
  return parts.join('; ');
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // accessToken이 존재하고 아직 유효하면 통과
  if (accessToken && !isJwtExpired(accessToken)) {
    return NextResponse.next();
  }

  // refreshToken이 없으면 통과 (비로그인 사용자)
  if (!refreshToken) {
    return NextResponse.next();
  }

  // 서버사이드에서 reissue 호출 (쿠키 전체 전달)
  try {
    const reissueRes = await fetch(`${API_BASE_URL}/api/v1/auth/reissue`, {
      method: 'POST',
      headers: {
        Cookie: request.headers.get('cookie') ?? '',
      },
    });

    if (!reissueRes.ok) {
      return NextResponse.next();
    }

    // Set-Cookie 헤더 파싱 (accessToken, refreshToken 두 개)
    const setCookies = reissueRes.headers.getSetCookie();

    // Server Component가 새 토큰을 볼 수 있도록 요청 쿠키 헤더도 업데이트
    let updatedCookieHeader = request.headers.get('cookie') ?? '';
    for (const setCookie of setCookies) {
      const [nameValue] = setCookie.split(';');
      const eqIdx = nameValue.indexOf('=');
      const name = nameValue.slice(0, eqIdx).trim();
      const value = nameValue.slice(eqIdx + 1).trim();
      updatedCookieHeader = updateCookieHeader(updatedCookieHeader, name, value);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('cookie', updatedCookieHeader);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });

    // 브라우저에도 새 쿠키 설정
    for (const setCookie of setCookies) {
      response.headers.append('set-cookie', setCookie);
    }

    return response;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  // API 라우트, Next.js 내부 파일, 정적 파일 제외하고 모든 경로에 적용
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
};
