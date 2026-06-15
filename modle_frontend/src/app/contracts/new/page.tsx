"use client";

import { client } from "@/lib/api/client";
import { FormEvent, ReactNode, useMemo, useState } from "react";

type ContractType = "TEMPLATE" | "FILE";
type PayType = "CASH" | "SERVICE";

type FormState = {
  applicationId: string;
  contractType: ContractType;
  shootDate: string;
  shootStartTime: string;
  shootEndTime: string;
  location: string;
  payment: string;
  payType: PayType;
  usageScope: string;
  memo: string;
  pdfUrl: string;
};
// 초기값은 개발 편의를 위해 하드코딩, 실제로는 지원서 데이터를 불러와서 채워야 함
const initialForm: FormState = {
  applicationId: "4",
  contractType: "TEMPLATE",
  shootDate: "2026-06-20",
  shootStartTime: "14:00",
  shootEndTime: "17:00",
  location: "서울 강남구 스튜디오 A",
  payment: "300000",
  payType: "CASH",
  usageScope: "브랜드 SNS 및 상세페이지 6개월 사용",
  memo: "촬영 의상 2벌 준비, 원본 제공 없음",
  pdfUrl: "",
};

export default function NewContractPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const preview = useMemo(
    () => ({
      shootStartAt: `${form.shootDate}T${form.shootStartTime}:00`,
      shootEndAt: `${form.shootDate}T${form.shootEndTime}:00`,
      paymentText:
        form.payType === "SERVICE"
          ? "서비스 제공"
          : `${Number(form.payment || 0).toLocaleString("ko-KR")}원`,
    }),
    [form],
  );

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    try {
      const { response } = await client.POST("/api/v1/contracts", {
        body: {
          applicationId: Number(form.applicationId),
          contractType: form.contractType,
          shootStartAt: preview.shootStartAt,
          shootEndAt: preview.shootEndAt,
          location: form.location,
          payment: Number(form.payment || 0),
          payType: form.payType,
          usageScope: form.usageScope,
          memo: form.memo || undefined,
          pdfUrl: form.pdfUrl || undefined,
        },
      });

      if (!response.ok) {
        throw new Error("계약서 저장에 실패했습니다.");
      }

      setStatus("success");
      setMessage("계약서가 DRAFT 상태로 저장되었습니다.");
    } catch(error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "계약서 저장에 실패했습니다.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-hairline pb-6">
          <p className="font-mono text-xs leading-4 tracking-[0.4px] text-mute">
            CONTRACT / DRAFT
          </p>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[28px] font-bold leading-9 text-ink">
                계약서 임시 저장
              </h1>
              <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-body">
                촬영 조건을 입력하고 DRAFT 상태의 계약서를 생성합니다.
              </p>
            </div>
            <span className="inline-flex h-8 w-fit items-center gap-2 rounded-full bg-canvas-soft px-3 text-[13px] font-semibold leading-5 text-body">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              DRAFT
            </span>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
        >
          <section className="rounded-xl border border-hairline bg-surface p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Field label="지원 ID" required>
                <input
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  inputMode="numeric"
                  value={form.applicationId}
                  onChange={(event) =>
                    updateField("applicationId", event.target.value)
                  }
                />
              </Field>

              <Field label="계약 유형" required>
                <select
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  value={form.contractType}
                  onChange={(event) =>
                    updateField(
                      "contractType",
                      event.target.value as ContractType,
                    )
                  }
                >
                  <option value="TEMPLATE">템플릿 작성</option>
                  <option value="FILE">PDF 파일 첨부</option>
                </select>
              </Field>

              <Field label="촬영일" required>
                <input
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  type="date"
                  value={form.shootDate}
                  onChange={(event) =>
                    updateField("shootDate", event.target.value)
                  }
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="시작 시간" required>
                  <input
                    className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                    type="time"
                    value={form.shootStartTime}
                    onChange={(event) =>
                      updateField("shootStartTime", event.target.value)
                    }
                  />
                </Field>
                <Field label="종료 시간" required>
                  <input
                    className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                    type="time"
                    value={form.shootEndTime}
                    onChange={(event) =>
                      updateField("shootEndTime", event.target.value)
                    }
                  />
                </Field>
              </div>

              <Field label="촬영 장소" required className="md:col-span-2">
                <input
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  value={form.location}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                />
              </Field>

              <Field label="보수 유형" required>
                <div className="grid grid-cols-2 gap-2">
                  {(["CASH", "SERVICE"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`h-11 rounded-md border px-4 text-[15px] font-semibold leading-6 transition ${
                        form.payType === type
                          ? "border-primary bg-primary text-on-primary"
                          : "border-hairline bg-surface text-body hover:border-hairline-strong"
                      }`}
                      onClick={() => updateField("payType", type)}
                    >
                      {type === "CASH" ? "현금" : "서비스"}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="보수 금액" required>
                <input
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  inputMode="numeric"
                  value={form.payment}
                  onChange={(event) =>
                    updateField("payment", event.target.value)
                  }
                />
              </Field>

              <Field label="사용 범위" required className="md:col-span-2">
                <textarea
                  className="min-h-28 w-full resize-y rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  value={form.usageScope}
                  onChange={(event) =>
                    updateField("usageScope", event.target.value)
                  }
                />
              </Field>

              <Field label="기타 조건" className="md:col-span-2">
                <textarea
                  className="min-h-28 w-full resize-y rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  value={form.memo}
                  onChange={(event) => updateField("memo", event.target.value)}
                />
              </Field>

              <Field label="PDF URL" className="md:col-span-2">
                <input
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  placeholder="파일 업로드 연동 전 임시 URL"
                  value={form.pdfUrl}
                  onChange={(event) =>
                    updateField("pdfUrl", event.target.value)
                  }
                />
              </Field>
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-hairline bg-surface p-6">
            <h2 className="text-lg font-semibold leading-[26px] text-ink">
              저장 미리보기
            </h2>
            <dl className="mt-5 space-y-4 text-[13px] leading-5">
              <PreviewRow label="지원 ID" value={`#${form.applicationId}`} />
              <PreviewRow label="계약 유형" value={form.contractType} />
              <PreviewRow label="촬영 시작" value={preview.shootStartAt} mono />
              <PreviewRow label="촬영 종료" value={preview.shootEndAt} mono />
              <PreviewRow label="장소" value={form.location} />
              <PreviewRow label="보수" value={preview.paymentText} />
            </dl>

            <div className="mt-6 border-t border-hairline pt-5">
              <button
                type="submit"
                disabled={status === "saving"}
                className="h-11 w-full rounded-lg bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
              >
                {status === "saving" ? "저장 중" : "임시 저장"}
              </button>
              {message ? (
                <p
                  className={`mt-3 rounded-md px-3 py-2 text-[13px] leading-5 ${
                    status === "success"
                      ? "bg-success-soft text-success"
                      : "bg-error-soft text-error"
                  }`}
                >
                  {message}
                </p>
              ) : null}
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  required,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-[13px] font-semibold leading-5 text-ink">
        {label}
        {required ? <span className="text-error"> *</span> : null}
      </span>
      {children}
    </label>
  );
}

function PreviewRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3">
      <dt className="text-mute">{label}</dt>
      <dd
        className={`min-w-0 break-words text-ink ${
          mono ? "font-mono text-xs tracking-[0.4px]" : ""
        }`}
      >
        {value || "-"}
      </dd>
    </div>
  );
}
