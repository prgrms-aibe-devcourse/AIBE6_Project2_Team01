"use client";

import { useEmailVerification } from "@/hooks/useEmailVerification";
import type { ReactNode, SubmitEvent } from "react";
import { useState } from "react";

import Link from "next/link";

import { client } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/error";
import { PasswordInput } from "@/components/ui/PasswordInput";

type ClientType = "INDIVIDUAL" | "ORGANIZATION";

type FormState = {
  email: string;
  password: string;
  region: string;
  companyName: string;
  companyNumber: string;
  clientType: ClientType;
};

const initialForm: FormState = {
  email: "",
  password: "",
  region: "",
  companyName: "",
  companyNumber: "",
  clientType: "INDIVIDUAL",
};

const CLIENT_TYPE_OPTIONS: { value: ClientType; label: string }[] = [
  { value: "INDIVIDUAL", label: "개인" },
  { value: "ORGANIZATION", label: "사업자" },
];

export default function ClientSignupPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  const emailVerification = useEmailVerification();
  const isEmailVerified =
    form.email !== "" && emailVerification.verifiedEmail === form.email;

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const { data, error } = await client.POST("/api/v1/auth/signup/client", {
      body: {
        email: form.email,
        password: form.password,
        region: form.region,
        companyName: form.companyName,
        companyNumber: form.companyNumber,
        clientType: form.clientType,
      },
    });

    if (error) {
      setStatus("error");
      setMessage(getErrorMessage(error, "회원가입에 실패했습니다."));
      return;
    }

    setStatus("success");
    setMessage(
      data?.msg ??
        "회원가입이 완료되었습니다. 관리자 승인 후 이용할 수 있습니다.",
    );
  };

  if (status === "success") {
    return (
      <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-12 text-ink">
        <div className="w-full max-w-[420px] rounded-lg border border-hairline bg-surface p-8 text-center">
          <h1 className="text-lg font-semibold leading-[26px] text-ink">
            가입이 완료되었습니다
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-body">{message}</p>
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
    <main className="flex flex-1 justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-[480px]">
        <h1 className="text-[28px] font-bold leading-9 text-ink">
          의뢰인 회원가입
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-body">
          의뢰인 정보를 입력하고 이메일 인증을 완료해주세요. 가입 후 관리자
          승인이 필요합니다.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field label="이메일" required>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              />
              <button
                type="button"
                disabled={
                  !form.email ||
                  emailVerification.status === "sending" ||
                  isEmailVerified
                }
                onClick={() => emailVerification.sendCode(form.email)}
                className="h-11 shrink-0 rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink disabled:text-mute"
              >
                {isEmailVerified ? "인증완료" : "인증코드 발송"}
              </button>
            </div>
          </Field>

          {!isEmailVerified && emailVerification.status !== "idle" ? (
            <Field label="인증코드" required>
              <div className="flex gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={emailVerification.code}
                  onChange={(event) =>
                    emailVerification.setCode(event.target.value)
                  }
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                />
                <button
                  type="button"
                  disabled={emailVerification.status === "confirming"}
                  onClick={() => emailVerification.confirmCode(form.email)}
                  className="h-11 shrink-0 rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink disabled:text-mute"
                >
                  확인
                </button>
              </div>
            </Field>
          ) : null}

          {emailVerification.message ? (
            <p
              className={`text-[13px] leading-5 ${
                emailVerification.status === "verified"
                  ? "text-success"
                  : "text-mute"
              }`}
            >
              {emailVerification.message}
            </p>
          ) : null}

          <Field label="비밀번호" required>
            <PasswordInput
              required
              minLength={5}
              maxLength={50}
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            />
          </Field>

          <Field label="활동 지역" required>
            <input
              type="text"
              required
              maxLength={50}
              value={form.region}
              onChange={(event) => updateField("region", event.target.value)}
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            />
          </Field>

          <Field label="업체명" required>
            <input
              type="text"
              required
              maxLength={100}
              value={form.companyName}
              onChange={(event) =>
                updateField("companyName", event.target.value)
              }
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            />
          </Field>

          <Field label="사업자/개인 식별번호" required>
            <input
              type="text"
              required
              maxLength={20}
              value={form.companyNumber}
              onChange={(event) =>
                updateField("companyNumber", event.target.value)
              }
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            />
          </Field>

          <Field label="가입 유형" required>
            <div className="grid grid-cols-2 gap-2">
              {CLIENT_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField("clientType", option.value)}
                  className={`h-11 rounded-md border px-4 text-[15px] font-semibold leading-6 transition ${
                    form.clientType === option.value
                      ? "border-primary bg-primary text-on-primary"
                      : "border-hairline bg-surface text-body hover:border-hairline-strong"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </Field>

          <button
            type="submit"
            disabled={status === "submitting" || !isEmailVerified}
            className="mt-2 h-11 w-full rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
          >
            {status === "submitting" ? "가입 중" : "가입하기"}
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
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-semibold leading-5 text-ink">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
