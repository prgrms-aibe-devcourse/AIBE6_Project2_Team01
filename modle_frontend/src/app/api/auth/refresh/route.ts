import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const redirectParam = searchParams.get('redirect') ?? '/';

  // open redirect 방지: 반드시 상대 경로여야 함
  const redirectTo = redirectParam.startsWith('/') ? redirectParam : '/';

  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refreshToken')?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const reissueRes = await fetch(`${API_BASE_URL}/api/v1/auth/reissue`, {
      method: 'POST',
      // refreshToken만 전달 — 만료된 accessToken을 같이 보낼 필요 없음
      headers: { Cookie: `refreshToken=${refreshToken}` },
    });

    if (!reissueRes.ok) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // 원래 페이지로 리다이렉트하면서 브라우저에 새 쿠키 설정
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    for (const setCookie of reissueRes.headers.getSetCookie()) {
      response.headers.append('set-cookie', setCookie);
    }
    return response;
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}
