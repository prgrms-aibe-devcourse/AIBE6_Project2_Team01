"use client";

import type { ReactNode, SubmitEvent } from "react";
import { useState } from "react";

import Link from "next/link";

import { confirmPasswordResetCode, resetPassword, sendPasswordResetCode } from "@/lib/api/auth";

type Step = "email" | "code" | "password" | "done";

export default function FindPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendCode = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      const sentMessage = await sendPasswordResetCode(email);
      setMessage(sentMessage);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증코드 발송에 실패했습니다.");
    } finally {
      setStatus("idle");
    }
  };

  const handleConfirmCode = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setError("");

    try {
      await confirmPasswordResetCode(email, code);
      setMessage("");
      setStep("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "인증코드가 올바르지 않습니다.");
    } finally {
      setStatus("idle");
    }
  };

  const handleResetPassword = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setStatus("submitting");

    try {
      await resetPassword(email, newPassword);
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "비밀번호 재설정에 실패했습니다.");
    } finally {
      setStatus("idle");
    }
  };

  if (step === "done") {
    return (
      <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-12 text-ink">
        <div className="w-full max-w-[420px] rounded-lg border border-hairline bg-surface p-8 text-center">
          <h1 className="text-lg font-semibold leading-[26px] text-ink">
            비밀번호가 변경되었습니다
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-body">
            새 비밀번호로 로그인해주세요.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover"
          >
            로그인하기
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-[400px]">
        <h1 className="text-[28px] font-bold leading-9 text-ink">비밀번호 찾기</h1>
        <p className="mt-2 text-[15px] leading-6 text-body">
          {step === "email"
            ? "가입한 이메일로 인증코드를 받아 비밀번호를 재설정합니다."
            : step === "code"
              ? "이메일로 받은 인증코드를 입력해주세요."
              : "새 비밀번호를 입력해주세요."}
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendCode} className="mt-8 flex flex-col gap-4">
            <Field label="이메일">
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              />
            </Field>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-2 h-11 w-full rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
            >
              {status === "submitting" ? "발송 중" : "인증코드 발송"}
            </button>

            {error ? <ErrorMessage message={error} /> : null}
          </form>
        ) : null}

        {step === "code" ? (
          <form onSubmit={handleConfirmCode} className="mt-8 flex flex-col gap-4">
            {message ? <p className="text-[13px] leading-5 text-mute">{message}</p> : null}

            <Field label="인증코드">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              />
            </Field>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-2 h-11 w-full rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
            >
              {status === "submitting" ? "확인 중" : "확인"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setMessage("");
                setError("");
              }}
              className="h-11 w-full rounded-md border border-hairline-strong bg-surface px-6 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
            >
              이메일 다시 입력
            </button>

            {error ? <ErrorMessage message={error} /> : null}
          </form>
        ) : null}

        {step === "password" ? (
          <form onSubmit={handleResetPassword} className="mt-8 flex flex-col gap-4">
            <Field label="새 비밀번호">
              <input
                type="password"
                required
                minLength={5}
                maxLength={50}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              />
            </Field>

            <Field label="새 비밀번호 확인">
              <input
                type="password"
                required
                minLength={5}
                maxLength={50}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              />
            </Field>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="mt-2 h-11 w-full rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
            >
              {status === "submitting" ? "변경 중" : "비밀번호 변경"}
            </button>

            {error ? <ErrorMessage message={error} /> : null}
          </form>
        ) : null}

        <p className="mt-6 text-center text-[13px] leading-5 text-mute">
          <Link href="/login" className="font-semibold text-ink underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold leading-5 text-ink">{label}</span>
      {children}
    </label>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-md bg-error-soft px-3 py-2 text-[13px] leading-5 text-error" aria-live="polite">
      {message}
    </p>
  );
}
