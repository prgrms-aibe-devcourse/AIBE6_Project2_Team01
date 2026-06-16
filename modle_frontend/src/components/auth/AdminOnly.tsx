"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

// 비로그인은 /login, ADMIN이 아닌 로그인 사용자는 /로 보낸다.
export function AdminOnly({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
    } else if (user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== "ADMIN") {
    return null;
  }

  return <>{children}</>;
}
