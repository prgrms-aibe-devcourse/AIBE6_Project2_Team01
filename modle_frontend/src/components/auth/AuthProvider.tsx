"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useEffect, useState } from "react";

import { client, setSessionExpiredHandler } from "@/lib/api/client";
import {
  deleteAuthUserCookie,
  readAuthUserCookie,
  writeAuthUserCookie,
} from "@/lib/auth/cookie";
import type { AuthUser } from "@/types/auth";

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const cookieUser = readAuthUserCookie();

    if (cookieUser) {
      // 쿠키 값을 컴포넌트 상태로 동기화하는 마운트 시 1회 초기화
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(cookieUser);
      setIsLoading(false);
    } else {
      // 쿠키가 없어도 accessToken/refreshToken이 유효하면(OAuth 로그인 등) 내 정보를 조회해 동기화
      client.GET("/api/v1/auth/me").then(({ data }) => {
        const me = data?.data;
        if (me?.role) {
          const nextUser: AuthUser = { id: me.id, role: me.role };
          writeAuthUserCookie(nextUser);
          setUser(nextUser);
        }
        setIsLoading(false);
      });
    }

    setSessionExpiredHandler(() => {
      deleteAuthUserCookie();
      setUser(null);
    });

    return () => setSessionExpiredHandler(null);
  }, []);

  const login = useCallback((nextUser: AuthUser) => {
    writeAuthUserCookie(nextUser);
    setUser(nextUser);
  }, []);

  const logout = useCallback(async () => {
    await client.POST("/api/v1/auth/logout").catch(() => undefined);
    deleteAuthUserCookie();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
