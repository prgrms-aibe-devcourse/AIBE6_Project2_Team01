import createClient from "openapi-fetch";

import type { paths } from "./schema";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export const client = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: "include",
});

// accessToken이 만료(401)되면 refreshToken으로 재발급 후 원요청을 한 번만 재시도
// 아래 경로들은 인증이 필요 없거나(로그인/가입/이메일 인증) 재발급 대상이 아니므로(로그아웃/재발급 자체) 제외
const REISSUE_EXEMPT_PATHS = [
  "/api/v1/auth/login",
  "/api/v1/auth/logout",
  "/api/v1/auth/reissue",
  "/api/v1/auth/signup/model",
  "/api/v1/auth/signup/client",
  "/api/v1/auth/email/verify/send",
  "/api/v1/auth/email/verify/confirm",
];

let sessionExpiredHandler: (() => void) | null = null;

/** refreshToken까지 만료되어 재발급이 실패했을 때 호출할 콜백을 등록 AuthProvider가 mount 시 등록 */
export function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

// onRequest 시점에 요청 바디가 소비되기 전에 복제해두고, onResponse에서 재시도용으로 사용
const pendingRequests = new Map<string, Request>();

client.use({
  onRequest({ request, id }) {
    pendingRequests.set(id, request.clone());
  },
  async onResponse({ id, request, response }) {
    const original = pendingRequests.get(id);
    pendingRequests.delete(id);

    if (response.status !== 401) {
      return undefined;
    }

    const pathname = new URL(request.url).pathname;
    if (REISSUE_EXEMPT_PATHS.includes(pathname) || !original) {
      return undefined;
    }

    const reissueRes = await fetch(`${API_BASE_URL}/api/v1/auth/reissue`, {
      method: "POST",
      credentials: "include",
    });

    if (!reissueRes.ok) {
      sessionExpiredHandler?.();
      return undefined;
    }

    return fetch(original);
  },
});
