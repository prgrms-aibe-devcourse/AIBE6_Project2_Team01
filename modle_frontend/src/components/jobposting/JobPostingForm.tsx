"use client";

import { FormEvent, ReactNode, useState } from "react";

export type Category =
  | "HAIR"
  | "MAKEUP"
  | "CLOTHING"
  | "FITTING"
  | "HAND"
  | "FOOD"
  | "PRODUCT"
  | "ETC";
export type Region =
  | "SEOUL"
  | "BUSAN"
  | "DAEGU"
  | "INCHEON"
  | "GWANGJU"
  | "DAEJEON"
  | "ULSAN"
  | "SEJONG"
  | "GYEONGGI"
  | "GANGWON"
  | "CHUNGBUK"
  | "CHUNGNAM"
  | "JEONBUK"
  | "JEONNAM"
  | "GYEONGBUK"
  | "GYEONGNAM"
  | "JEJU";
export type RequiredSex = "M" | "F" | "ANY";
export type PayType = "CASH" | "SERVICE" | "FREE";

export type JobPostingFormState = {
  title: string;
  content: string;
  category: Category | "";
  region: Region | "";
  requiredSex: RequiredSex;
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
  weightMin: string;
  weightMax: string;
  minCareerMonths: string;
  payment: string;
  payType: PayType | "";
  shootDate: string;
};

export const defaultFormState: JobPostingFormState = {
  title: "",
  content: "",
  category: "",
  region: "",
  requiredSex: "ANY",
  ageMin: "",
  ageMax: "",
  heightMin: "",
  heightMax: "",
  weightMin: "",
  weightMax: "",
  minCareerMonths: "",
  payment: "",
  payType: "",
  shootDate: "",
};

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "HAIR", label: "헤어" },
  { value: "MAKEUP", label: "메이크업" },
  { value: "CLOTHING", label: "의류" },
  { value: "FITTING", label: "피팅" },
  { value: "HAND", label: "핸드" },
  { value: "FOOD", label: "음식" },
  { value: "PRODUCT", label: "제품" },
  { value: "ETC", label: "기타" },
];

const REGION_OPTIONS: { value: Region; label: string }[] = [
  { value: "SEOUL", label: "서울" },
  { value: "BUSAN", label: "부산" },
  { value: "DAEGU", label: "대구" },
  { value: "INCHEON", label: "인천" },
  { value: "GWANGJU", label: "광주" },
  { value: "DAEJEON", label: "대전" },
  { value: "ULSAN", label: "울산" },
  { value: "SEJONG", label: "세종" },
  { value: "GYEONGGI", label: "경기" },
  { value: "GANGWON", label: "강원" },
  { value: "CHUNGBUK", label: "충북" },
  { value: "CHUNGNAM", label: "충남" },
  { value: "JEONBUK", label: "전북" },
  { value: "JEONNAM", label: "전남" },
  { value: "GYEONGBUK", label: "경북" },
  { value: "GYEONGNAM", label: "경남" },
  { value: "JEJU", label: "제주" },
];

type Props = {
  initialValues?: Partial<JobPostingFormState>;
  onSubmit: (data: JobPostingFormState) => Promise<void>;
  submitLabel: string;
};

export function JobPostingForm({ initialValues, onSubmit, submitLabel }: Props) {
  const [form, setForm] = useState<JobPostingFormState>({
    ...defaultFormState,
    ...initialValues,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  const updateField = <K extends keyof JobPostingFormState>(
    key: K,
    value: JobPostingFormState[K],
  ) => {
    setForm((cur) => ({ ...cur, [key]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("saving");
    setMessage("");
    try {
      await onSubmit(form);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "오류가 발생했습니다.");
    }
  };

  const inputClass =
    "h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink";
  const toggleBtn = (active: boolean) =>
    `h-11 rounded-md border px-4 text-[15px] font-semibold leading-6 transition ${
      active
        ? "border-primary bg-primary text-on-primary"
        : "border-hairline bg-surface text-body hover:border-hairline-strong"
    }`;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      <section className="rounded-xl border border-hairline bg-surface p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="제목" required className="md:col-span-2">
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </Field>

          <Field label="내용" required className="md:col-span-2">
            <textarea
              className="min-h-32 w-full resize-y rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
              value={form.content}
              onChange={(e) => updateField("content", e.target.value)}
              required
            />
          </Field>

          <Field label="카테고리" required>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) =>
                updateField("category", e.target.value as Category)
              }
              required
            >
              <option value="">선택하세요</option>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="지역" required>
            <select
              className={inputClass}
              value={form.region}
              onChange={(e) =>
                updateField("region", e.target.value as Region)
              }
              required
            >
              <option value="">선택하세요</option>
              {REGION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="성별 조건" required>
            <div className="grid grid-cols-3 gap-2">
              {(["ANY", "M", "F"] as const).map((sex) => (
                <button
                  key={sex}
                  type="button"
                  className={toggleBtn(form.requiredSex === sex)}
                  onClick={() => updateField("requiredSex", sex)}
                >
                  {sex === "ANY" ? "무관" : sex === "M" ? "남성" : "여성"}
                </button>
              ))}
            </div>
          </Field>

          <Field label="촬영 예정일">
            <input
              className={inputClass}
              type="date"
              value={form.shootDate}
              onChange={(e) => updateField("shootDate", e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="최소 나이">
              <input
                className={inputClass}
                type="number"
                min={15}
                max={80}
                value={form.ageMin}
                onChange={(e) => updateField("ageMin", e.target.value)}
              />
            </Field>
            <Field label="최대 나이">
              <input
                className={inputClass}
                type="number"
                min={15}
                max={80}
                value={form.ageMax}
                onChange={(e) => updateField("ageMax", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="최소 키 (cm)">
              <input
                className={inputClass}
                type="number"
                min={100}
                max={220}
                value={form.heightMin}
                onChange={(e) => updateField("heightMin", e.target.value)}
              />
            </Field>
            <Field label="최대 키 (cm)">
              <input
                className={inputClass}
                type="number"
                min={100}
                max={220}
                value={form.heightMax}
                onChange={(e) => updateField("heightMax", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="최소 몸무게 (kg)">
              <input
                className={inputClass}
                type="number"
                min={30}
                max={150}
                value={form.weightMin}
                onChange={(e) => updateField("weightMin", e.target.value)}
              />
            </Field>
            <Field label="최대 몸무게 (kg)">
              <input
                className={inputClass}
                type="number"
                min={30}
                max={150}
                value={form.weightMax}
                onChange={(e) => updateField("weightMax", e.target.value)}
              />
            </Field>
          </div>

          <Field label="최소 경력 (개월)">
            <input
              className={inputClass}
              type="number"
              min={0}
              max={600}
              value={form.minCareerMonths}
              onChange={(e) => updateField("minCareerMonths", e.target.value)}
            />
          </Field>

          <Field label="보수 유형">
            <div className="grid grid-cols-3 gap-2">
              {(["CASH", "SERVICE", "FREE"] as const).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  className={toggleBtn(form.payType === pt)}
                  onClick={() => {
                    if (pt !== "CASH") updateField("payment", "");
                    updateField("payType", pt);
                  }}
                >
                  {pt === "CASH" ? "현금" : pt === "SERVICE" ? "서비스" : "무료"}
                </button>
              ))}
            </div>
          </Field>

          {form.payType === "CASH" ? (
            <Field label="보수 금액 (원)" required>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={form.payment}
                onChange={(e) => updateField("payment", e.target.value)}
                required
              />
            </Field>
          ) : null}
        </div>
      </section>

      <aside className="h-fit rounded-xl border border-hairline bg-surface p-6">
        <h2 className="text-lg font-semibold leading-[26px] text-ink">
          미리보기
        </h2>
        <dl className="mt-5 space-y-4 text-[13px] leading-5">
          <PreviewRow label="제목" value={form.title} />
          <PreviewRow label="카테고리" value={form.category} />
          <PreviewRow label="지역" value={form.region} />
          <PreviewRow label="성별" value={form.requiredSex} />
          <PreviewRow
            label="보수"
            value={
              form.payType === "FREE"
                ? "무료"
                : form.payType === "SERVICE"
                  ? "서비스 제공"
                  : form.payment
                    ? `${Number(form.payment).toLocaleString("ko-KR")}원`
                    : "-"
            }
          />
          <PreviewRow label="촬영일" value={form.shootDate} />
        </dl>

        <div className="mt-6 border-t border-hairline pt-5">
          <button
            type="submit"
            disabled={status === "saving"}
            className="h-11 w-full rounded-lg bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
          >
            {status === "saving" ? "저장 중..." : submitLabel}
          </button>
          {message ? (
            <p className="mt-3 rounded-md bg-error-soft px-3 py-2 text-[13px] leading-5 text-error">
              {message}
            </p>
          ) : null}
        </div>
      </aside>
    </form>
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

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3">
      <dt className="text-mute">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{value || "-"}</dd>
    </div>
  );
}
