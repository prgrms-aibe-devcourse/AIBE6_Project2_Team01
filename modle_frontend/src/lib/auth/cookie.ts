import type { AuthUser } from '@/types/auth'

const AUTH_USER_COOKIE = 'modle_auth_user'
// refreshToken 수명(7일)과 동일하게 맞춤
const AUTH_USER_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export function readAuthUserCookie(): AuthUser | null {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${AUTH_USER_COOKIE}=`))

  if (!match) {
    return null
  }

  try {
    const value = decodeURIComponent(match.slice(AUTH_USER_COOKIE.length + 1))
    const parsed = JSON.parse(value) as AuthUser

    const VALID_ROLES: AuthUser['role'][] = ['MODEL', 'CLIENT', 'ADMIN']

    if (
      (parsed.id !== undefined && typeof parsed.id !== 'number') ||
      !VALID_ROLES.includes(parsed.role)
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function writeAuthUserCookie(user: AuthUser) {
  if (typeof document === 'undefined') {
    return
  }

  const value = encodeURIComponent(JSON.stringify(user))
  document.cookie = `${AUTH_USER_COOKIE}=${value}; path=/; max-age=${AUTH_USER_COOKIE_MAX_AGE}; samesite=lax`
}

export function deleteAuthUserCookie() {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${AUTH_USER_COOKIE}=; path=/; max-age=0; samesite=lax`
}
