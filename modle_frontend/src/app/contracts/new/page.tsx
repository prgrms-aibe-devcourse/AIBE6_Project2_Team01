"use client";

import { client } from "@/lib/api/client";
import {
  getContractDraft,
  type ContractDraftResponse,
} from "@/lib/api/contract";
import { getErrorMessage } from "@/lib/api/error";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  ReactNode,
  Suspense,
  useEffect,
  useMemo,
  useState,
} from "react";

type ContractType = "TEMPLATE" | "FILE";
type PayType = "CASH" | "SERVICE" | "FREE";

type ContractTemplate = {
  id: number;
  title: string;
  content: string;
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

const TEMPLATE_FALLBACK_TEXT = "별도 예정";
const DEV_MOCK_APPLICATION_ID_START = 900001;
const DEV_MOCK_APPLICATION_ID_STORAGE_KEY = "contracts:new:mock-application-id";

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
  const [status, setStatus] = useState<"idle" | "loading" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [templatesStatus, setTemplatesStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [templatesMessage, setTemplatesMessage] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [draftContractId, setDraftContractId] = useState<number | null>(null);
  const [hasDraftContract, setHasDraftContract] = useState(false);
  const [lastSavedFormKey, setLastSavedFormKey] = useState<string | null>(null);

  const todayStr = useMemo(() => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }, []);

  // 촬영일이 오늘이면 시작 시간도 현재 시각 이후만 선택 가능
  const minStartTime = useMemo(() => {
    if (form.shootDate !== todayStr) {
      return undefined;
    }
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  }, [form.shootDate, todayStr]);

  const isFileContract = form.contractType === "FILE";
  const isTemplateContract = form.contractType === "TEMPLATE";
  const selectedTemplate =
    templates.find((template) => String(template.id) === selectedTemplateId) ?? null;
  const currentFormKey = useMemo(() => JSON.stringify(form), [form]);
  const hasUnsavedChanges =
    hasDraftContract &&
    lastSavedFormKey !== null &&
    currentFormKey !== lastSavedFormKey;

  useEffect(() => {
    if (!isTemplateContract || templatesStatus !== "idle") {
      return;
    }

    async function fetchTemplates() {
      setTemplatesStatus("loading");
      setTemplatesMessage("");

      const { data, error, response } = await client.GET("/api/v1/contracts/templates");

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
    }

    void fetchTemplates();
  }, [isTemplateContract, templatesStatus]);

  useEffect(() => {
    if (!applicationIdFromQuery || isUsingMockApplicationId) {
      return;
    }

    let ignore = false;

    async function fetchDraft() {
      setStatus("loading");
      setMessage("");

      try {
        const draft = await getContractDraft(Number(applicationIdFromQuery));

        if (ignore) {
          return;
        }

        const nextForm = mapDraftToForm(draft);
        setForm(nextForm);
        setDraftContractId(draft.contractId);
        setHasDraftContract(true);
        setLastSavedFormKey(JSON.stringify(nextForm));
        setStatus("idle");
        setMessage("기존 임시 저장 계약서를 불러왔습니다.");
      } catch {
        if (ignore) {
          return;
        }

        setDraftContractId(null);
        setHasDraftContract(false);
        setLastSavedFormKey(null);
        setStatus("idle");
        setMessage("");
      }
    }

    void fetchDraft();

    return () => {
      ignore = true;
    };
  }, [applicationIdFromQuery, isUsingMockApplicationId]);

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
            ? "무료"
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

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handlePayTypeChange(payType: PayType) {
    setForm((current) => ({
      ...current,
      payType,
      payment: payType === "FREE" ? "0" : "",
    }));
  }

  function handleContractTypeChange(contractType: ContractType) {
    setForm((current) => ({
      ...current,
      contractType,
      pdfUrl: contractType === "TEMPLATE" ? "" : current.pdfUrl,
    }));

    if (contractType === "FILE") {
      setSelectedTemplateId("");
      return;
    }

    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(String(templates[0].id));
    }
  }

  function validateForm() {
    if (!form.applicationId.trim()) {
      return "지원 ID가 없습니다. 지원서 화면에서 다시 진입해주십시오.";
    }

    if (!/^\d+$/.test(form.applicationId.trim())) {
      return "지원 ID는 숫자여야 합니다.";
    }

    if (!form.shootDate || !form.shootStartTime || !form.shootEndTime) {
      return "촬영 날짜와 시간을 모두 입력해주십시오.";
    }

    if (new Date(preview.shootStartAt) < new Date()) {
      return "촬영 시작 일시는 현재 시각 이후여야 합니다.";
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

    if (isTemplateContract && templatesStatus === "success" && !selectedTemplateId) {
      return "계약서 템플릿을 선택해주십시오.";
    }

    const payment = Number(form.payType === "FREE" ? "0" : form.payment);

    if (form.payType !== "FREE" && !form.payment.trim()) {
      return "보수 금액은 필수입니다.";
    }

    if (Number.isNaN(payment)) {
      return "보수 금액은 숫자여야 합니다.";
    }

    if (form.payType === "CASH" && payment <= 0) {
      return "현금 계약은 보수 금액이 0보다 커야 합니다.";
    }

    if (form.payType === "SERVICE" && payment < 0) {
      return "서비스 계약은 보수 금액이 0 이상이어야 합니다.";
    }

    if (form.payType === "FREE" && payment !== 0) {
      return "무료 계약은 보수 금액이 0이어야 합니다.";
    }

    if (isFileContract && !form.pdfUrl.trim()) {
      return "파일 첨부 방식 계약은 PDF URL이 필요합니다.";
    }

    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

      setDraftContractId(savedContract.id);
      setHasDraftContract(true);
      setLastSavedFormKey(JSON.stringify(form));
      setStatus("success");
      setMessage("계약서가 DRAFT 상태로 저장되었습니다.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "계약서 저장에 실패했습니다.",
      );
    }
  }

  function handleContinue() {
    if (!draftContractId) {
      return;
    }

    const payment = form.payType === "FREE" ? 0 : Number(form.payment || "0");
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

    router.push(`/contracts/${draftContractId}?${detailParams.toString()}`);
  }

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
                촬영 조건을 입력하고 DRAFT 상태의 계약서를 저장합니다.
              </p>
            </div>
            <span className="inline-flex h-8 w-fit items-center gap-2 rounded-full bg-canvas-soft px-3 text-[13px] font-semibold leading-5 text-body">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              DRAFT
            </span>
          </div>
          {hasDraftContract ? (
            <div className="mt-4 rounded-xl bg-canvas-soft px-4 py-3 text-[14px] leading-6 text-body">
              기존 임시 저장 계약서를 이어서 작업 중입니다.
            </div>
          ) : null}
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
                      개발 환경에서는 지원 ID가 없을 때 900001부터 목업 값이 자동으로 들어갑니다.
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
                  <Field label="계약서 템플릿" required className="md:col-span-2">
                    {templatesStatus === "loading" ? (
                      <div className="rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[14px] text-body">
                        템플릿 목록을 불러오는 중입니다.
                      </div>
                    ) : templatesStatus === "error" ? (
                      <div className="rounded-md bg-error-soft px-3 py-3 text-[14px] text-error">
                        {templatesMessage || "템플릿 목록을 불러오지 못했습니다."}
                      </div>
                    ) : templates.length === 0 ? (
                      <div className="rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[14px] text-body">
                        사용할 수 있는 템플릿이 없습니다.
                      </div>
                    ) : (
                      <select
                        className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                        value={selectedTemplateId}
                        onChange={(event) => setSelectedTemplateId(event.target.value)}
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
                  min={todayStr}
                  value={form.shootDate}
                  onChange={(event) => updateField("shootDate", event.target.value)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="시작 시간" required>
                  <input
                    className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                    type="time"
                    min={minStartTime}
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
                  onChange={(event) => updateField("location", event.target.value)}
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
                      {type === "CASH" ? "현금" : type === "SERVICE" ? "서비스" : "무료"}
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
                  onChange={(event) => updateField("payment", event.target.value)}
                />
              </Field>

              <Field label="사용 범위" required className="md:col-span-2">
                <textarea
                  className="min-h-28 w-full resize-y rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  value={form.usageScope}
                  onChange={(event) => updateField("usageScope", event.target.value)}
                />
              </Field>

              <Field label="기타 조건" className="md:col-span-2">
                <textarea
                  className="min-h-28 w-full resize-y rounded-md border border-hairline bg-canvas-soft px-3 py-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink"
                  value={form.memo}
                  onChange={(event) => updateField("memo", event.target.value)}
                />
              </Field>

              <Field label="PDF URL" required={isFileContract} className="md:col-span-2">
                <input
                  className="h-11 w-full rounded-md border border-hairline bg-canvas-soft px-3 text-[15px] leading-6 text-ink outline-none transition focus:border-ink disabled:bg-canvas-soft disabled:text-mute"
                  placeholder={
                    isFileContract
                      ? "FILE 계약은 PDF URL을 입력해야 합니다."
                      : "템플릿 계약은 URL을 입력할 수 없습니다."
                  }
                  value={isTemplateContract ? "" : form.pdfUrl}
                  disabled={isTemplateContract}
                  onChange={(event) => updateField("pdfUrl", event.target.value)}
                />
              </Field>
            </div>
          </section>

          <aside className="h-fit rounded-xl border border-hairline bg-surface p-6">
            <h2 className="text-lg font-semibold leading-[26px] text-ink">
              상세 미리보기
            </h2>
            <dl className="mt-5 space-y-4 text-[13px] leading-5">
              <PreviewRow label="지원 ID" value={`#${form.applicationId}`} />
              <PreviewRow
                label="계약 유형"
                value={form.contractType === "TEMPLATE" ? "템플릿 작성" : "PDF 파일 첨부"}
              />
              <PreviewRow label="촬영 시작" value={preview.shootStartAt} mono />
              <PreviewRow label="촬영 종료" value={preview.shootEndAt} mono />
              <PreviewRow label="장소" value={form.location} />
              <PreviewRow label="보수" value={preview.paymentText} />
            </dl>

            <div className="mt-6 border-t border-hairline pt-5">
              <button
                type="submit"
                disabled={status === "saving" || status === "loading"}
                className="h-11 w-full rounded-lg bg-primary px-6 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
              >
                {status === "saving"
                  ? "저장 중..."
                  : hasDraftContract
                    ? "수정 저장"
                    : "임시 저장"}
              </button>

              {draftContractId ? (
                <button
                  type="button"
                  disabled={status === "saving" || status === "loading" || hasUnsavedChanges}
                  onClick={handleContinue}
                  className="mt-3 h-11 w-full rounded-lg border border-black bg-white px-6 text-[15px] font-semibold leading-6 text-black transition hover:bg-black hover:text-white disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  계약 진행하기
                </button>
              ) : null}

              {hasUnsavedChanges ? (
                <p className="mt-3 rounded-md bg-canvas-soft px-3 py-2 text-[13px] leading-5 text-body">
                  변경 사항이 있으면 먼저 수정 저장 후 계약을 진행해주십시오.
                </p>
              ) : null}

              {message ? (
                <p
                  className={`mt-3 rounded-md px-3 py-2 text-[13px] leading-5 ${
                    status === "success"
                      ? "bg-success-soft text-success"
                      : status === "error"
                        ? "bg-error-soft text-error"
                        : "bg-canvas-soft text-body"
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

function mapDraftToForm(draft: ContractDraftResponse): FormState {
  return {
    applicationId: String(draft.applicationId),
    contractType: draft.contractType,
    shootDate: draft.shootStartAt.slice(0, 10),
    shootStartTime: draft.shootStartAt.slice(11, 16),
    shootEndTime: draft.shootEndAt.slice(11, 16),
    location: draft.location ?? "",
    payment: draft.payment != null ? String(draft.payment) : "",
    payType: draft.payType,
    usageScope: draft.usageScope ?? "",
    memo: draft.memo ?? "",
    pdfUrl: draft.pdfUrl ?? "",
  };
}

function getNextDevMockApplicationId() {
  if (typeof window === "undefined") {
    return String(DEV_MOCK_APPLICATION_ID_START);
  }

  const savedValue = window.localStorage.getItem(DEV_MOCK_APPLICATION_ID_STORAGE_KEY);
  const parsedValue = Number(savedValue);
  const nextValue =
    Number.isInteger(parsedValue) && parsedValue >= DEV_MOCK_APPLICATION_ID_START
      ? parsedValue + 1
      : DEV_MOCK_APPLICATION_ID_START;

  window.localStorage.setItem(
    DEV_MOCK_APPLICATION_ID_STORAGE_KEY,
    String(nextValue),
  );

  return String(nextValue);
}

function getPayTypeLabel(payType: PayType) {
  if (payType === "CASH") {
    return "현금";
  }

  if (payType === "SERVICE") {
    return "서비스";
  }

  return "무료";
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
