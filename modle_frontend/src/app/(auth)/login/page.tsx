"use client";

import { useAuth } from "@/hooks/useAuth";
import type { ReactNode, SubmitEvent } from "react";
import { Suspense, useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { client } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/error";
import { GOOGLE_OAUTH_URL, KAKAO_OAUTH_URL, NAVER_OAUTH_URL } from "@/lib/auth/oauth";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();

  const oauthError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    oauthError ? "error" : "idle",
  );
  const [message, setMessage] = useState(oauthError ?? "");

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const { data: result, error } = await client.POST("/api/v1/auth/login", {
      body: { email, password },
    });

    if (error || !result?.data || !result.data.item.role) {
      setStatus("error");
      setMessage(getErrorMessage(error, "로그인에 실패했습니다."));
      return;
    }

    login({ id: result.data.item.id, role: result.data.item.role });
    setStatus("idle");
    const next = new URLSearchParams(window.location.search).get("next");
    router.push(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
  };

  return (
    <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-[400px]">
        <h1 className="text-[28px] font-bold leading-9 text-ink">로그인</h1>
        <p className="mt-2 text-[15px] leading-6 text-body">
          모들 계정으로 로그인하세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field label="이메일">
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            />
          </Field>

          <Field label="비밀번호">
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            />
          </Field>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="mt-2 h-11 w-full rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
          >
            {status === "submitting" ? "로그인 중" : "로그인"}
          </button>

          {message ? (
            <p
              className="rounded-md bg-error-soft px-3 py-2 text-[13px] leading-5 text-error"
              aria-live="polite"
            >
              {message}
            </p>
          ) : null}
        </form>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-hairline" />
          <span className="text-[13px] leading-5 text-mute">또는</span>
          <span className="h-px flex-1 bg-hairline" />
        </div>

        <a
          href={GOOGLE_OAUTH_URL}
          className="mt-4 flex h-11 w-full items-center justify-center rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
        >
          Google로 로그인
        </a>

        <a
          href={KAKAO_OAUTH_URL}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
        >
          카카오로 로그인
        </a>

        <a
          href={NAVER_OAUTH_URL}
          className="mt-3 flex h-11 w-full items-center justify-center rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
        >
          네이버로 로그인
        </a>

        <p className="mt-6 text-center text-[13px] leading-5 text-mute">
          계정이 없으신가요?{" "}
          <Link href="/signup" className="font-semibold text-ink underline">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold leading-5 text-ink">
        {label}
      </span>
      {children}
    </label>
  );
}
