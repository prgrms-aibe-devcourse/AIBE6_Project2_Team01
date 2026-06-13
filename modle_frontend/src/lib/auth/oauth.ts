import { API_BASE_URL } from '@/lib/api/client'

// 백엔드 구글 OAuth2 로그인 시작 URL. <a href>로 전체 페이지 이동시켜야
// 구글 로그인 후 백엔드가 내려주는 쿠키(redirect 체인)를 정상적으로 받을 수 있다.
export const GOOGLE_OAUTH_URL = `${API_BASE_URL}/oauth2/authorization/google`
