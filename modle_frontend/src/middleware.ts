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

// async 없는 순수 리다이렉트만 수행 — 미들웨어에서 직접 reissue를 호출하면
// 페이지 클라이언트 인터셉터와 동시에 같은 refreshToken을 사용해 TOKEN_STOLEN 충돌이 발생함
export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // accessToken이 존재하고 유효하면 통과
  if (accessToken && !isJwtExpired(accessToken)) {
    return NextResponse.next();
  }

  // refreshToken이 없으면 통과 (비로그인 사용자는 각 페이지에서 처리)
  if (!refreshToken) {
    return NextResponse.next();
  }

  // 토큰 갱신 전용 Route Handler로 리다이렉트
  // — Route Handler가 reissue 완료 후 새 쿠키를 설정한 뒤 원래 페이지로 돌아옴
  // — 리다이렉트 완료 전까지 클라이언트 JS가 실행되지 않으므로 race condition 없음
  const refreshUrl = new URL('/api/auth/refresh', request.url);
  refreshUrl.searchParams.set(
    'redirect',
    request.nextUrl.pathname + request.nextUrl.search,
  );

  return NextResponse.redirect(refreshUrl);
}

export const config = {
  // api, Next.js 내부, 정적 파일 제외 — /api/auth/refresh 자체도 제외되어 무한 루프 방지
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico).*)'],
};
