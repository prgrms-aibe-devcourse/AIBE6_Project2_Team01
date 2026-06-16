"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { client } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/error";
import { REGION_OPTIONS } from "@/lib/constants/region";

type Role = "MODEL" | "CLIENT";
type ClientType = "INDIVIDUAL" | "ORGANIZATION";

type FormState = {
  region: string;
  name: string;
  height: string;
  weight: string;
  age: string;
  sex: "M" | "F";
  companyName: string;
  companyNumber: string;
  clientType: ClientType;
};

const initialForm: FormState = {
  region: "",
  name: "",
  height: "",
  weight: "",
  age: "",
  sex: "M",
  companyName: "",
  companyNumber: "",
  clientType: "INDIVIDUAL",
};

const CLIENT_TYPE_OPTIONS: { value: ClientType; label: string }[] = [
  { value: "INDIVIDUAL", label: "개인" },
  { value: "ORGANIZATION", label: "사업자" },
];

export default function AdditionalInfoPage() {
  const { login, logout } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<Role | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!role) {
      return;
    }

    setStatus("submitting");
    setMessage("");

    const { data, error } = await client.POST("/api/v1/auth/signup/additional", {
      body:
        role === "MODEL"
          ? {
              role: "MODEL",
              region: form.region,
              name: form.name,
              height: Number(form.height),
              weight: Number(form.weight),
              age: Number(form.age),
              sex: form.sex,
            }
          : {
              role: "CLIENT",
              region: form.region,
              companyName: form.companyName,
              companyNumber: form.companyNumber,
              clientType: form.clientType,
            },
    });

    if (error) {
      setStatus("error");
      setMessage(getErrorMessage(error, "추가 정보 입력에 실패했습니다."));
      return;
    }

    if (role === "MODEL") {
      // 모델은 가입 즉시 활동 가능하므로 로그인 상태를 유지한 채 메인으로 이동
      login({ role: "MODEL" });
      router.push("/");
      return;
    }

    // 의뢰인은 관리자 승인 전까지 이용할 수 없으므로 세션을 종료하고 안내 후 로그인 페이지로 이동
    await logout();
    setStatus("success");
    setMessage(data?.msg ?? "추가 정보 입력이 완료되었습니다.");
  };

  if (status === "success") {
    return (
      <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-12 text-ink">
        <div className="w-full max-w-[420px] rounded-lg border border-hairline bg-surface p-8 text-center">
          <h1 className="text-lg font-semibold leading-[26px] text-ink">
            가입이 완료되었습니다
          </h1>
          <p className="mt-2 text-[15px] leading-6 text-body">
            관리자 승인 후 이용할 수 있습니다.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover"
          >
            로그인 페이지로 이동
          </Link>
        </div>
      </main>
    );
  }

  if (!role) {
    return (
      <main className="flex flex-1 items-center justify-center bg-canvas px-4 py-12 text-ink">
        <div className="w-full max-w-[480px]">
          <h1 className="text-[28px] font-bold leading-9 text-ink">추가 정보 입력</h1>
          <p className="mt-2 text-[15px] leading-6 text-body">
            구글 계정으로 가입을 완료하려면 역할을 선택하고 정보를 입력해주세요.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setRole("MODEL")}
              className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-6 text-left transition hover:border-ink"
            >
              <span className="text-lg font-semibold leading-[26px] text-ink">
                모델로 가입
              </span>
              <span className="text-[13px] leading-5 text-body">
                촬영 모델로 활동하고 공고에 지원합니다.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setRole("CLIENT")}
              className="flex flex-col gap-2 rounded-lg border border-hairline bg-surface p-6 text-left transition hover:border-ink"
            >
              <span className="text-lg font-semibold leading-[26px] text-ink">
                의뢰인으로 가입
              </span>
              <span className="text-[13px] leading-5 text-body">
                촬영 공고를 등록하고 모델을 찾습니다.
              </span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-1 justify-center bg-canvas px-4 py-12 text-ink">
      <div className="w-full max-w-[480px]">
        <h1 className="text-[28px] font-bold leading-9 text-ink">
          {role === "MODEL" ? "모델 추가 정보" : "의뢰인 추가 정보"}
        </h1>
        <p className="mt-2 text-[15px] leading-6 text-body">
          서비스 이용을 위한 추가 정보를 입력해주세요.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <Field label="활동 지역" required>
            <select
              required
              value={form.region}
              onChange={(event) => updateField("region", event.target.value)}
              className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
            >
              <option value="" disabled>지역을 선택하세요</option>
              {REGION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>

          {role === "MODEL" ? (
            <>
              <Field label="이름" required>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                />
              </Field>

              <div className="grid grid-cols-3 gap-3">
                <Field label="키(cm)" required>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.height}
                    onChange={(event) => updateField("height", event.target.value)}
                    className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  />
                </Field>
                <Field label="몸무게(kg)" required>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.weight}
                    onChange={(event) => updateField("weight", event.target.value)}
                    className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  />
                </Field>
                <Field label="나이" required>
                  <input
                    type="number"
                    required
                    min={1}
                    value={form.age}
                    onChange={(event) => updateField("age", event.target.value)}
                    className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  />
                </Field>
              </div>

              <Field label="성별" required>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => updateField("sex", "M")}
                    className={`h-11 rounded-md border px-4 text-[15px] font-semibold leading-6 transition ${
                      form.sex === "M"
                        ? "border-primary bg-primary text-on-primary"
                        : "border-hairline bg-surface text-body hover:border-hairline-strong"
                    }`}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField("sex", "F")}
                    className={`h-11 rounded-md border px-4 text-[15px] font-semibold leading-6 transition ${
                      form.sex === "F"
                        ? "border-primary bg-primary text-on-primary"
                        : "border-hairline bg-surface text-body hover:border-hairline-strong"
                    }`}
                  >
                    여성
                  </button>
                </div>
              </Field>
            </>
          ) : (
            <>
              <Field label="업체명" required>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.companyName}
                  onChange={(event) => updateField("companyName", event.target.value)}
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                />
              </Field>

              <Field label="사업자/개인 식별번호" required>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={form.companyNumber}
                  onChange={(event) => updateField("companyNumber", event.target.value)}
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
            </>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setRole(null)}
              className="h-11 shrink-0 rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
            >
              역할 다시 선택
            </button>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="h-11 w-full rounded-md bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
            >
              {status === "submitting" ? "제출 중" : "제출하기"}
            </button>
          </div>

          {message ? (
            <p className="rounded-md bg-error-soft px-3 py-2 text-[13px] leading-5 text-error">
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
