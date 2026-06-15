"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";

const ROLE_LABEL: Record<string, string> = {
  MODEL: "모델",
  CLIENT: "의뢰인",
  ADMIN: "관리자",
};

export function NavBar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-hairline bg-canvas px-6">
      <Link href="/" className="text-[15px] font-bold leading-6 text-ink">
        Modle
      </Link>

      <div className="flex items-center gap-3">
        {isLoading ? null : user ? (
          <>
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-[13px] font-semibold leading-5 text-ink hover:underline"
              >
                관리자
              </Link>
            )}
            <span className="text-[13px] leading-5 text-body">
              {ROLE_LABEL[user.role] ?? user.role} 계정
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="h-11 rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover"
            >
              회원가입
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
