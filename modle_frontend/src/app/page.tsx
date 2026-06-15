"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { Alert } from "@/components/ui/Alert";

const ROLE_LABEL: Record<string, string> = {
  MODEL: "모델",
  CLIENT: "의뢰인",
  ADMIN: "관리자",
};

const PRIMARY_CTA_CLASS =
  "inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover";

const SECONDARY_CTA_CLASS =
  "inline-flex h-11 items-center justify-center rounded-md border border-hairline-strong bg-surface px-6 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink";

export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-canvas px-4 py-20 text-center text-ink">
        <div>
          <h1 className="text-[32px] font-bold leading-10 text-ink">Modle</h1>
          <p className="mt-3 text-[15px] leading-6 text-body">
            모델과 의뢰인을 잇는 매칭 플랫폼입니다.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className={SECONDARY_CTA_CLASS}>
            로그인
          </Link>
          <Link href="/signup" className={PRIMARY_CTA_CLASS}>
            회원가입
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-canvas px-4 py-20 text-center text-ink">
      <Alert variant="success">
        환영합니다, {ROLE_LABEL[user.role] ?? user.role}님!
      </Alert>
      <div className="flex gap-3">
        <Link href="/jobs" className={PRIMARY_CTA_CLASS}>
          공고 둘러보기
        </Link>
        {user.role === "CLIENT" ? (
          <Link href="/jobs/new" className={SECONDARY_CTA_CLASS}>
            공고 등록하기
          </Link>
        ) : null}
      </div>
    </main>
  );
}
