"use client";

import { CATEGORY_OPTIONS } from "@/lib/constants/category";
import { REGION_OPTIONS } from "@/lib/constants/region";
import { uploadImages } from "@/lib/api/image";
import { ChangeEvent, FormEvent, ReactNode, useState } from "react";

export type Category =
  | "HAIR"
  | "MAKEUP"
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

export type AiGenerateParams = {
  category: string;
  title: string;
  shootDate: string;
  payType: string;
  ageMin?: number;
  ageMax?: number;
  requiredSex?: string;
};

export type JobPostingFormState = {
  title: string;
  content: string;
  category: Category | "";
  region: Region | "";
  requiredSex: RequiredSex;
  requiredCount: string;
  ageMin: string;
  ageMax: string;
  heightMin: string;
  heightMax: string;
  weightMin: string;
  weightMax: string;
  minCareerMonths: string;
  payment: string;
  payType: PayType | "";
  serviceDetail: string;
  shootDate: string;
  imageUrls: string[];
};

export const defaultFormState: JobPostingFormState = {
  title: "",
  content: "",
  category: "",
  region: "",
  requiredSex: "ANY",
  requiredCount: "",
  ageMin: "",
  ageMax: "",
  heightMin: "",
  heightMax: "",
  weightMin: "",
  weightMax: "",
  minCareerMonths: "",
  payment: "",
  payType: "",
  serviceDetail: "",
  shootDate: "",
  imageUrls: [],
};


type Props = {
  initialValues?: Partial<JobPostingFormState>;
  onSubmit: (data: JobPostingFormState) => Promise<void>;
  submitLabel: string;
  externalCategory?: Category | "";
  onAiGenerate?: (params: AiGenerateParams) => Promise<string>;
};

export function JobPostingForm({
  initialValues,
  onSubmit,
  submitLabel,
  externalCategory,
  onAiGenerate,
}: Props) {
  const [form, setForm] = useState<JobPostingFormState>({
    ...defaultFormState,
    ...initialValues,
  });
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");
  const [aiState, setAiState] = useState<"idle" | "generating">("idle");
  const [aiError, setAiError] = useState("");
  const [aiGenerated, setAiGenerated] = useState(false);
  const [uploading, setUploading] = useState(false);

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [prevExternalCategory, setPrevExternalCategory] = useState(externalCategory);
  if (prevExternalCategory !== externalCategory && externalCategory) {
    setPrevExternalCategory(externalCategory);
    setForm((cur) => ({ ...cur, category: externalCategory }));
  }

  const updateField = <K extends keyof JobPostingFormState>(
    key: K,
    value: JobPostingFormState[K],
  ) => {
    setForm((cur) => ({ ...cur, [key]: value }));
  };

  const handleAiGenerate = async () => {
    setAiError("");
    const errors: string[] = [];
    if (!form.title.trim()) errors.push("제목을 입력해주세요.");
    if (!form.shootDate) errors.push("촬영 예정일을 입력해주세요.");
    if (!form.payType) errors.push("보수 유형을 선택해주세요.");
    if (!form.ageMin && !form.ageMax) errors.push("나이 최소 또는 최대를 입력해주세요.");
    if (errors.length > 0) {
      setAiError(errors.join(" "));
      return;
    }
    setAiState("generating");
    try {
      const content = await onAiGenerate!({
        category: form.category,
        title: form.title,
        shootDate: form.shootDate,
        payType: form.payType,
        ageMin: form.ageMin ? Number(form.ageMin) : undefined,
        ageMax: form.ageMax ? Number(form.ageMax) : undefined,
        requiredSex: form.requiredSex,
      });
      updateField("content", content);
      setAiGenerated(true);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI 본문 생성에 실패했습니다.");
    } finally {
      setAiState("idle");
    }
  };

  const handleImageSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // 같은 파일 재선택 허용
    if (files.length === 0) return;
    if (form.imageUrls.length + files.length > 5) {
      setMessage("이미지는 최대 5장까지 첨부할 수 있습니다.");
      setStatus("error");
      return;
    }
    setUploading(true);
    try {
      const urls = await uploadImages(files);
      setForm((cur) => ({ ...cur, imageUrls: [...cur.imageUrls, ...urls] }));
    } catch {
      setStatus("error");
      setMessage("이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleImageRemove = (index: number) => {
    setForm((cur) => ({
      ...cur,
      imageUrls: cur.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.content.trim()) {
      setStatus("error");
      setMessage("공고 본문을 입력해주세요.");
      return;
    }
    if (!form.payType) {
      setStatus("error");
      setMessage("보수 유형을 선택해주세요.");
      return;
    }
    if (form.shootDate && form.shootDate < todayStr) {
      setStatus("error");
      setMessage("촬영 예정일은 오늘 이후로 선택해주세요.");
      return;
    }
    if (!form.ageMin && !form.ageMax) {
      setStatus("error");
      setMessage("나이 최소 또는 최대를 입력해주세요.");
      return;
    }

    const rangeError =
      validateRange(form.ageMin, form.ageMax, "나이", 15, 80) ??
      validateRange(form.heightMin, form.heightMax, "키", 100, 220) ??
      validateRange(form.weightMin, form.weightMax, "몸무게", 30, 150);
    if (rangeError) {
      setStatus("error");
      setMessage(rangeError);
      return;
    }

    if (form.requiredCount) {
      const count = Number(form.requiredCount);
      if (!Number.isInteger(count) || count < 1 || count > 100) {
        setStatus("error");
        setMessage("최종 섭외 인원은 1~100 사이의 정수로 입력해주세요.");
        return;
      }
    }

    if (form.minCareerMonths) {
      const months = Number(form.minCareerMonths);
      if (!Number.isInteger(months) || months < 0 || months > 600) {
        setStatus("error");
        setMessage("최소 경력은 0~600개월 사이의 정수로 입력해주세요.");
        return;
      }
    }

    if (form.payType === "CASH") {
      const pay = Number(form.payment);
      if (!form.payment || !Number.isInteger(pay) || pay < 0) {
        setStatus("error");
        setMessage("보수 금액은 0 이상의 정수로 입력해주세요.");
        return;
      }
    }

    if (form.payType === "SERVICE" && !form.serviceDetail.trim()) {
      setStatus("error");
      setMessage("제공 서비스 내용을 입력해주세요.");
      return;
    }

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

  const aiMode = !!onAiGenerate && !!form.category;
  const showAiButton = aiMode && !form.content;

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
    >
      {/* 메인: 제목·내용 */}
      <section className="flex flex-col rounded-xl border border-hairline bg-surface p-6">
        <div className="flex flex-1 flex-col gap-6">
          <Field label="제목" required>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </Field>

          <Field label="내용" required className="flex flex-1 flex-col">
            {showAiButton ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleAiGenerate}
                  disabled={aiState === "generating"}
                  className="flex h-14 w-full items-center justify-center rounded-md border-2 border-dashed border-primary bg-canvas-soft text-[15px] font-semibold text-primary transition hover:bg-canvas disabled:opacity-50"
                >
                  {aiState === "generating" ? "AI 본문 생성 중..." : "✦ AI 본문 생성"}
                </button>
                {aiError ? (
                  <p className="rounded-md bg-error-soft px-3 py-2 text-[13px] leading-5 text-error">
                    {aiError}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="flex flex-1 flex-col gap-2">
                {aiGenerated && (
                  <div className="flex items-start gap-2 rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-[13px] leading-5 text-mute">
                    <p className="flex-1">✦ AI가 생성한 초안입니다. 내용을 검토하고 필요한 경우 수정 후 등록해주세요.</p>
                    <button
                      type="button"
                      onClick={() => setAiGenerated(false)}
                      className="shrink-0 hover:text-ink"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <textarea
                  className="min-h-0 flex-1 w-full resize-none overflow-y-auto rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  value={form.content}
                  onChange={(e) => {
                    updateField("content", e.target.value);
                    setAiGenerated(false);
                  }}
                />
              </div>
            )}
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold leading-5 text-ink">
              이미지 첨부
              <span className="ml-1 font-normal text-mute">(최대 5장, 본문 하단에 노출)</span>
            </span>
            <div className="flex flex-wrap gap-3">
              {form.imageUrls.map((url, index) => (
                <div key={url} className="relative h-24 w-24 overflow-hidden rounded-md border border-hairline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`첨부 이미지 ${index + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(index)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/70 text-[11px] text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {form.imageUrls.length < 5 ? (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-hairline-strong text-[12px] text-mute transition hover:border-primary hover:text-primary">
                  {uploading ? "업로드 중..." : "＋ 추가"}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                    disabled={uploading}
                  />
                </label>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 우측: 옵션 설정 + 등록 버튼 */}
      <aside className="flex flex-col rounded-xl border border-hairline bg-surface p-6">
        <h2 className="text-[15px] font-semibold leading-6 text-ink">옵션 설정</h2>

        <div className="mt-4 flex-1 overflow-y-auto grid gap-4">
          <Field label="카테고리" required>
            <select
              className={inputClass}
              value={form.category}
              onChange={(e) => updateField("category", e.target.value as Category)}
              required
            >
              <option value="">선택하세요</option>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>

          <Field label="지역" required>
            <select
              className={inputClass}
              value={form.region}
              onChange={(e) => updateField("region", e.target.value as Region)}
              required
            >
              <option value="">선택하세요</option>
              {REGION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
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

          <Field label="최종 섭외 인원" required>
            <input
              className={inputClass}
              type="number"
              min={1}
              max={100}
              value={form.requiredCount}
              onChange={(e) => updateField("requiredCount", e.target.value)}
              required
            />
          </Field>

          <Field label="촬영 예정일" required>
            <input
              className={inputClass}
              type="date"
              min={todayStr}
              value={form.shootDate}
              onChange={(e) => updateField("shootDate", e.target.value)}
              required
            />
          </Field>

          <div>
            <span className="mb-2 block text-[13px] font-semibold leading-5 text-ink">
              나이<span className="text-error"> *</span>
              <span className="ml-1 font-normal text-mute">(최소 또는 최대)</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="mb-1 block text-[12px] leading-5 text-mute">최소</span>
                <input
                  className={inputClass}
                  type="number"
                  min={15}
                  max={80}
                  value={form.ageMin}
                  onChange={(e) => updateField("ageMin", e.target.value)}
                />
              </div>
              <div>
                <span className="mb-1 block text-[12px] leading-5 text-mute">최대</span>
                <input
                  className={inputClass}
                  type="number"
                  min={15}
                  max={80}
                  value={form.ageMax}
                  onChange={(e) => updateField("ageMax", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <span className="mb-2 block text-[13px] font-semibold leading-5 text-ink">키 (cm)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="mb-1 block text-[12px] leading-5 text-mute">최소</span>
                <input
                  className={inputClass}
                  type="number"
                  min={100}
                  max={220}
                  value={form.heightMin}
                  onChange={(e) => updateField("heightMin", e.target.value)}
                />
              </div>
              <div>
                <span className="mb-1 block text-[12px] leading-5 text-mute">최대</span>
                <input
                  className={inputClass}
                  type="number"
                  min={100}
                  max={220}
                  value={form.heightMax}
                  onChange={(e) => updateField("heightMax", e.target.value)}
                />
              </div>
            </div>
          </div>

          <div>
            <span className="mb-2 block text-[13px] font-semibold leading-5 text-ink">몸무게 (kg)</span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="mb-1 block text-[12px] leading-5 text-mute">최소</span>
                <input
                  className={inputClass}
                  type="number"
                  min={30}
                  max={150}
                  value={form.weightMin}
                  onChange={(e) => updateField("weightMin", e.target.value)}
                />
              </div>
              <div>
                <span className="mb-1 block text-[12px] leading-5 text-mute">최대</span>
                <input
                  className={inputClass}
                  type="number"
                  min={30}
                  max={150}
                  value={form.weightMax}
                  onChange={(e) => updateField("weightMax", e.target.value)}
                />
              </div>
            </div>
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

          <Field label="보수 유형" required>
            <div className="grid grid-cols-3 gap-2">
              {(["CASH", "SERVICE", "FREE"] as const).map((pt) => (
                <button
                  key={pt}
                  type="button"
                  className={toggleBtn(form.payType === pt)}
                  onClick={() => {
                    if (pt !== "CASH") updateField("payment", "");
                    if (pt !== "SERVICE") updateField("serviceDetail", "");
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

          {form.payType === "SERVICE" ? (
            <Field label="제공 서비스" required>
              <input
                className={inputClass}
                value={form.serviceDetail}
                onChange={(e) => updateField("serviceDetail", e.target.value)}
                placeholder="예: 시술 1회 무료 제공"
                maxLength={50}
                required
              />
            </Field>
          ) : null}
        </div>

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

// 최소/최대 입력값의 범위와 역전 여부를 검증한다 (값이 없으면 통과). 문제가 있으면 메시지, 없으면 null.
function validateRange(
  minStr: string,
  maxStr: string,
  label: string,
  lo: number,
  hi: number,
): string | null {
  const min = minStr ? Number(minStr) : null;
  const max = maxStr ? Number(maxStr) : null;
  if (min !== null && (!Number.isInteger(min) || min < lo || min > hi))
    return `${label} 최소는 ${lo}~${hi} 사이의 정수로 입력해주세요.`;
  if (max !== null && (!Number.isInteger(max) || max < lo || max > hi))
    return `${label} 최대는 ${lo}~${hi} 사이의 정수로 입력해주세요.`;
  if (min !== null && max !== null && min > max)
    return `${label} 최소값이 최대값보다 클 수 없습니다.`;
  return null;
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
