"use client";

import { client } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/error";
import {
  FormEvent,
  ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

type ContractType = "TEMPLATE" | "FILE";
type PayType = "CASH" | "SERVICE" | "FREE";
type ContractTemplate = {
  id: number;
  title: string;
  content: string;
};

const TEMPLATE_FALLBACK_TEXT = "연동 예정";
const DEV_MOCK_APPLICATION_ID_START = 900001;
const DEV_MOCK_APPLICATION_ID_STORAGE_KEY = "contracts:new:mock-application-id";

const getNextDevMockApplicationId = () => {
  if (typeof window === "undefined") {
    return String(DEV_MOCK_APPLICATION_ID_START);
  }

  const savedValue = window.localStorage.getItem(
    DEV_MOCK_APPLICATION_ID_STORAGE_KEY,
  );
  const parsedValue = Number(savedValue);
  const nextValue =
    Number.isInteger(parsedValue) &&
    parsedValue >= DEV_MOCK_APPLICATION_ID_START
      ? parsedValue + 1
      : DEV_MOCK_APPLICATION_ID_START;

  window.localStorage.setItem(
    DEV_MOCK_APPLICATION_ID_STORAGE_KEY,
    String(nextValue),
  );

  return String(nextValue);
};

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

const initialForm: FormState = {
  applicationId: "",
  contractType: "TEMPLATE",
  shootDate: "",
  shootStartTime: "",
  shootEndTime: "",
  location: "",
  payment: "",
  payType: "CASH",
  usageScope: "",
  memo: "",
  pdfUrl: "",
};

export default function NewContractPage() {
  return (
    <Suspense fallback={<NewContractPageFallback />}>
      <NewContractPageContent />
    </Suspense>
  );
}

function NewContractPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const applicationIdFromQuery = searchParams.get("applicationId") ?? "";
  const resolvedApplicationId =
    applicationIdFromQuery ||
    (process.env.NODE_ENV !== "production"
      ? getNextDevMockApplicationId()
      : "");
  const isUsingMockApplicationId =
    !applicationIdFromQuery && process.env.NODE_ENV !== "production";

  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    applicationId: resolvedApplicationId,
  }));
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [templatesStatus, setTemplatesStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [templatesMessage, setTemplatesMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  const isFileContract = form.contractType === "FILE";
  const isTemplateContract = form.contractType === "TEMPLATE";
  const selectedTemplate =
    templates.find((template) => String(template.id) === selectedTemplateId) ??
    null;

  useEffect(() => {
    if (!isTemplateContract || templatesStatus !== "idle") {
      return;
    }

    const fetchTemplates = async () => {
      setTemplatesStatus("loading");
      setTemplatesMessage("");

      const { data, error, response } = await client.GET(
        "/api/v1/contracts/templates",
      );

      if (error || !response.ok) {
        setTemplatesStatus("error");
        setTemplatesMessage(
          getErrorMessage(error, "계약서 템플릿 목록을 불러오지 못했습니다."),
        );
        return;
      }

      const templateData = (data as { data?: unknown } | undefined)?.data;
      const templateList = Array.isArray(templateData)
        ? templateData.filter(
            (template): template is ContractTemplate =>
              typeof template?.id === "number" &&
              typeof template?.title === "string" &&
              typeof template?.content === "string",
          )
        : [];
      setTemplates(templateList);
      setTemplatesStatus("success");

      if (templateList.length > 0) {
        setSelectedTemplateId(String(templateList[0].id));
      }
    };

    void fetchTemplates();
  }, [isTemplateContract, templatesStatus]);

  const preview = useMemo(
    () => ({
      shootStartAt:
        form.shootDate && form.shootStartTime
          ? `${form.shootDate}T${form.shootStartTime}:00`
          : "",
      shootEndAt:
        form.shootDate && form.shootEndTime
          ? `${form.shootDate}T${form.shootEndTime}:00`
          : "",
      paymentText:
        form.payType === "SERVICE"
          ? "서비스 제공"
          : form.payType === "FREE"
            ? "재능기부"
            : form.payment
              ? `${Number(form.payment).toLocaleString("ko-KR")}원`
              : "-",
    }),
    [form],
  );

  const renderedTemplateContent = useMemo(() => {
    if (!selectedTemplate) {
      return "";
    }

    const paymentText =
      form.payType === "FREE"
        ? "0원"
        : form.payment
          ? `${Number(form.payment).toLocaleString("ko-KR")}원`
          : TEMPLATE_FALLBACK_TEXT;

    const templateValues: Record<string, string> = {
      client_company_name: TEMPLATE_FALLBACK_TEXT,
      client_email: TEMPLATE_FALLBACK_TEXT,
      model_name: TEMPLATE_FALLBACK_TEXT,
      model_email: TEMPLATE_FALLBACK_TEXT,
      shoot_start_at: preview.shootStartAt || TEMPLATE_FALLBACK_TEXT,
      shootStartAt: preview.shootStartAt || TEMPLATE_FALLBACK_TEXT,
      shoot_end_at: preview.shootEndAt || TEMPLATE_FALLBACK_TEXT,
      shootEndAt: preview.shootEndAt || TEMPLATE_FALLBACK_TEXT,
      location: form.location.trim() || TEMPLATE_FALLBACK_TEXT,
      post_content: TEMPLATE_FALLBACK_TEXT,
      post_category: TEMPLATE_FALLBACK_TEXT,
      memo: form.memo.trim() || "없음",
      payment: paymentText,
      pay_type: getPayTypeLabel(form.payType),
      payType: getPayTypeLabel(form.payType),
      usage_scope: form.usageScope.trim() || TEMPLATE_FALLBACK_TEXT,
      usageScope: form.usageScope.trim() || TEMPLATE_FALLBACK_TEXT,
      signer_name: TEMPLATE_FALLBACK_TEXT,
      client_agreed_at: TEMPLATE_FALLBACK_TEXT,
      model_agreed_at: TEMPLATE_FALLBACK_TEXT,
      client_ip: TEMPLATE_FALLBACK_TEXT,
      model_ip: TEMPLATE_FALLBACK_TEXT,
      user_agent: TEMPLATE_FALLBACK_TEXT,
      pdf_hash: TEMPLATE_FALLBACK_TEXT,
    };

    return selectedTemplate.content.replaceAll(
      /\{\{(\w+)\}\}/g,
      (_, key: string) => templateValues[key] ?? TEMPLATE_FALLBACK_TEXT,
    );
  }, [form, preview, selectedTemplate]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handlePayTypeChange = (payType: PayType) => {
    setForm((current) => ({
      ...current,
      payType,
      payment: payType === "FREE" ? "0" : "",
    }));
  };

  const handleContractTypeChange = (contractType: ContractType) => {
    setForm((current) => ({ ...current, contractType }));

    if (contractType === "FILE") {
      setSelectedTemplateId("");
      return;
    }

    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(String(templates[0].id));
    }
  };

  const validateForm = () => {
    if (!form.applicationId.trim()) {
      return "지원 ID가 없습니다. 지원서 화면에서 다시 진입해주세요.";
    }

    if (!/^\d+$/.test(form.applicationId.trim())) {
      return "지원 ID는 숫자여야 합니다.";
    }

    if (!form.shootDate || !form.shootStartTime || !form.shootEndTime) {
      return "촬영 날짜와 시간을 모두 입력해주세요.";
    }

    if (preview.shootStartAt >= preview.shootEndAt) {
      return "촬영 종료 시간은 시작 시간보다 늦어야 합니다.";
    }

    if (!form.location.trim()) {
      return "촬영 장소는 필수입니다.";
    }

    if (!form.usageScope.trim()) {
      return "사용 범위는 필수입니다.";
    }

    if (
      isTemplateContract &&
      templatesStatus === "success" &&
      !selectedTemplateId
    ) {
      return "계약서 템플릿을 선택해주세요.";
    }

    const payment = Number(form.payType === "FREE" ? "0" : form.payment);

    if (form.payType !== "FREE" && !form.payment.trim()) {
      return "보수 금액은 필수입니다.";
    }

    if (Number.isNaN(payment)) {
      return "보수 금액은 숫자여야 합니다.";
    }

    if (form.payType === "CASH" && payment <= 0) {
      return "현금 계약의 보수 금액은 0보다 커야 합니다.";
    }

    if (form.payType === "SERVICE" && payment < 0) {
      return "서비스 계약의 보수 금액은 0 이상이어야 합니다.";
    }

    if (form.payType === "FREE" && payment !== 0) {
      return "재능기부 계약의 보수 금액은 0이어야 합니다.";
    }

    if (isFileContract && !form.pdfUrl.trim()) {
      return "파일 첨부 방식 계약은 PDF URL을 포함해야 합니다.";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setMessage("");

    const validationMessage = validateForm();
    if (validationMessage) {
      setStatus("error");
      setMessage(validationMessage);
      return;
    }

    try {
      const payment = form.payType === "FREE" ? 0 : Number(form.payment);

      const { data, error, response } = await client.POST("/api/v1/contracts", {
        body: {
          applicationId: Number(form.applicationId),
          contractType: form.contractType,
          shootStartAt: preview.shootStartAt,
          shootEndAt: preview.shootEndAt,
          location: form.location.trim(),
          payment,
          payType: form.payType,
          usageScope: form.usageScope.trim(),
          memo: form.memo.trim() || undefined,
          pdfUrl: form.pdfUrl.trim() || undefined,
        },
      });

      if (error || !response.ok) {
        throw new Error(getErrorMessage(error, "계약서 저장에 실패했습니다."));
      }

      const savedContract = (data as { data?: { id?: number } } | undefined)?.data;

      if (!savedContract?.id) {
        throw new Error("계약서 저장은 성공했지만 계약 ID를 받지 못했습니다.");
      }

      setStatus("success");
      setMessage("계약서가 DRAFT 상태로 저장되었습니다.");

      const detailParams = new URLSearchParams({
        source: "draft-created",
        applicationId: form.applicationId,
        contractType: form.contractType,
        payType: form.payType,
        payment: String(payment),
        shootDate: form.shootDate,
        shootStartTime: form.shootStartTime,
        shootEndTime: form.shootEndTime,
        location: form.location.trim(),
        usageScope: form.usageScope.trim(),
      });

      if (form.memo.trim()) {
        detailParams.set("memo", form.memo.trim());
      }

      if (form.pdfUrl.trim()) {
        detailParams.set("pdfUrl", form.pdfUrl.trim());
      }

      router.push(`/contracts/${savedContract.id}?${detailParams.toString()}`);
    } catch (error) {
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
                <div className="space-y-2">
                  <input
                    className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink disabled:text-mute"
                    inputMode="numeric"
                    value={form.applicationId}
                    disabled
                    readOnly
                  />
                  {isUsingMockApplicationId ? (
                    <p className="text-[13px] leading-5 text-mute">
                      개발 환경에서는 지원 ID가 없을 때 900001번대 목업 값이
                      자동으로 증가하며 들어갑니다.
                    </p>
                  ) : null}
                </div>
              </Field>

              <Field label="계약 유형" required>
                <select
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  value={form.contractType}
                  onChange={(event) =>
                    handleContractTypeChange(event.target.value as ContractType)
                  }
                >
                  <option value="TEMPLATE">템플릿 작성</option>
                  <option value="FILE">PDF 파일 첨부</option>
                </select>
              </Field>

              {isTemplateContract ? (
                <>
                  <Field
                    label="계약서 템플릿"
                    required
                    className="md:col-span-2"
                  >
                    {templatesStatus === "loading" ? (
                      <div className="rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[14px] text-body">
                        템플릿 목록을 불러오는 중입니다.
                      </div>
                    ) : templatesStatus === "error" ? (
                      <div className="rounded-md bg-error-soft px-3 py-3 text-[14px] text-error">
                        {templatesMessage ||
                          "템플릿 목록을 불러오지 못했습니다."}
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[14px] text-body">
                        사용할 수 있는 템플릿이 없습니다.
                      </div>
                    ) : (
                      <select
                        className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                        value={selectedTemplateId}
                        onChange={(event) =>
                          setSelectedTemplateId(event.target.value)
                        }
                      >
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.title}
                          </option>
                        ))}
                      </select>
                    )}
                  </Field>

                  {selectedTemplate ? (
                    <div className="md:col-span-2 rounded-xl border border-hairline bg-canvas-soft p-4">
                      <p className="text-[13px] font-semibold text-mute">
                        선택한 템플릿
                      </p>
                      <h3 className="mt-2 text-[17px] font-semibold text-ink">
                        {selectedTemplate.title}
                      </h3>
                      <pre className="mt-3 whitespace-pre-wrap break-words text-[14px] leading-6 text-body">
                        {renderedTemplateContent}
                      </pre>
                    </div>
                  ) : null}
                </>
              ) : null}

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
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH", "SERVICE", "FREE"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`h-11 rounded-md border px-4 text-[15px] font-semibold leading-6 transition ${
                        form.payType === type
                          ? "border-primary bg-primary text-on-primary"
                          : "border-hairline bg-surface text-body hover:border-hairline-strong"
                      }`}
                      onClick={() => handlePayTypeChange(type)}
                    >
                      {type === "CASH"
                        ? "현금"
                        : type === "SERVICE"
                          ? "서비스"
                          : "재능기부"}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="보수 금액" required>
                <input
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  inputMode="numeric"
                  value={form.payType === "FREE" ? "0" : form.payment}
                  disabled={form.payType === "FREE"}
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

              <Field
                label="PDF URL"
                required={isFileContract}
                className="md:col-span-2"
              >
                <input
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  placeholder={
                    isFileContract
                      ? "FILE 계약은 PDF URL을 입력해야 합니다."
                      : "FILE 계약일 때만 사용합니다."
                  }
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

function getPayTypeLabel(payType: PayType) {
  if (payType === "CASH") {
    return "현금";
  }

  if (payType === "SERVICE") {
    return "재화·서비스";
  }

  return "재능기부";
}

function NewContractPageFallback() {
  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-hairline bg-surface p-6 text-[15px] text-body">
          계약서 작성 화면을 불러오는 중입니다.
        </div>
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
