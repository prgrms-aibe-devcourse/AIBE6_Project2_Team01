"use client";

import { useEffect, useMemo, useState } from "react";

import { ContractAgreementActions } from "@/components/contract/ContractAgreementActions";
import { ContractNotifyButton } from "@/components/contract/ContractNotifyButton";
import { ContractStatusOverview } from "@/components/contract/ContractStatusOverview";
import { useAuth } from "@/hooks/useAuth";
import {
  formatContractStatus,
  getContractStatus,
  viewContract,
  type ContractStatus,
} from "@/lib/api/contract";

type ContractDetailContentProps = {
  contractId: number;
  initialQuery: {
    source?: string;
    applicationId?: string;
    contractType?: string;
    payType?: string;
    payment?: string;
    shootDate?: string;
    shootStartTime?: string;
    shootEndTime?: string;
    location?: string;
    usageScope?: string;
    memo?: string;
    pdfUrl?: string;
    signedPdfUrl?: string;
    status?: string;
  };
};

type DetailState = {
  applicationId?: number;
  contractType?: "TEMPLATE" | "FILE";
  payType?: "CASH" | "SERVICE" | "FREE";
  payment?: number;
  shootSchedule: string;
  location: string;
  usageScope: string;
  memo: string;
  pdfUrl: string;
  signedPdfUrl: string;
  rejectReason: string;
  status: ContractStatus;
};

const CONTRACT_TYPE_LABEL: Record<"TEMPLATE" | "FILE", string> = {
  TEMPLATE: "템플릿 작성",
  FILE: "PDF 파일 첨부",
};

const PAY_TYPE_LABEL: Record<"CASH" | "SERVICE" | "FREE", string> = {
  CASH: "현금",
  SERVICE: "서비스 제공",
  FREE: "무상",
};

export function ContractDetailContent({
  contractId,
  initialQuery,
}: ContractDetailContentProps) {
  const { user, isLoading } = useAuth();
  const [loadError, setLoadError] = useState("");
  const [isViewingContract, setIsViewingContract] = useState(false);
  const [hasViewedContract, setHasViewedContract] = useState(false);
  const [detail, setDetail] = useState<DetailState>(() =>
    buildDetailFromQuery(initialQuery),
  );

  const paymentText = useMemo(() => {
    if (!detail.payType) {
      return detail.payment != null
        ? `${detail.payment.toLocaleString("ko-KR")}원`
        : "-";
    }

    if (detail.payType === "FREE") {
      return "0원";
    }

    if (detail.payment == null || Number.isNaN(detail.payment)) {
      return "-";
    }

    return `${detail.payment.toLocaleString("ko-KR")}원`;
  }, [detail.payType, detail.payment]);

  const isCreatedFromDraft = initialQuery.source === "draft-created";
  const isModelUser = user?.role === "MODEL";
  const statusText =
    isModelUser && !hasViewedContract
      ? "확인 전"
      : formatContractStatus(detail.status);

  const applicationId = detail.applicationId;
  const documentUrl = getDocumentUrl(detail);

  useEffect(() => {
    if (applicationId == null || documentUrl) {
      return;
    }

    let ignore = false;

    async function loadContractStatus() {
      if (applicationId == null) {
        return;
      }

      try {
        const contractStatus = await getContractStatus(applicationId);

        if (ignore) {
          return;
        }

        setDetail((prev) => ({
          ...prev,
          status: contractStatus.status,
          pdfUrl: contractStatus.pdfUrl?.trim() || prev.pdfUrl,
          rejectReason: contractStatus.rejectReason?.trim() || prev.rejectReason,
        }));
      } catch {
        // 쿼리스트링 정보만으로도 화면 표시가 가능해야 하므로 보정 조회 실패는 무시합니다.
      }
    }

    void loadContractStatus();

    return () => {
      ignore = true;
    };
  }, [applicationId, documentUrl]);

  const handleViewContract = async () => {
    setIsViewingContract(true);
    setLoadError("");

    try {
      const contract = await viewContract(contractId);

      setDetail({
        applicationId: contract.applicationId,
        contractType: contract.contractType,
        payType: contract.payType,
        payment: contract.payment,
        shootSchedule: formatSchedule(
          contract.shootStartAt,
          contract.shootEndAt,
        ),
        location: contract.location ?? "-",
        usageScope: contract.usageScope ?? "-",
        memo: contract.memo?.trim() || "없음",
        pdfUrl: contract.pdfUrl?.trim() || "",
        signedPdfUrl: contract.signedPdfUrl?.trim() || "",
        rejectReason: contract.rejectReason?.trim() || "",
        status: contract.status,
      });
      setHasViewedContract(true);

      const documentUrl =
        contract.signedPdfUrl?.trim() || contract.pdfUrl?.trim() || "";

      if (documentUrl) {
        window.open(documentUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "계약서 정보를 불러오지 못했습니다.",
      );
    } finally {
      setIsViewingContract(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="rounded-2xl border border-hairline bg-surface p-6">
          <p className="font-mono text-xs leading-4 tracking-[0.4px] text-mute">
            CONTRACT / DETAIL
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <h1 className="text-[28px] font-bold leading-9 text-ink">
                계약서 상세
              </h1>
              <p className="text-[15px] leading-6 text-body">
                계약서 ID #{contractId}가 {statusText} 상태입니다.
              </p>
            </div>
            <span className="inline-flex h-8 w-fit items-center gap-2 rounded-full bg-canvas-soft px-3 text-[13px] font-semibold leading-5 text-body">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" />
              {statusText}
            </span>
          </div>
          {isCreatedFromDraft ? (
            <div className="mt-4 rounded-xl bg-success-soft px-4 py-3 text-[14px] leading-6 text-success">
              계약서 작성 화면에서 입력한 정보로 초안을 생성했습니다. PDF를 생성한 뒤 내용을 확인하고 모델에게 발송하시면 됩니다.
            </div>
          ) : (
            <div className="mt-4 rounded-xl bg-canvas-soft px-4 py-3 text-[14px] leading-6 text-body">
              {isModelUser && !hasViewedContract
                ? "계약서 확인 버튼을 눌러 열람한 뒤 상세 정보와 동의 여부를 확인하실 수 있습니다."
                : "계약 상세 API와 연결된 화면입니다. 실제 계약서 데이터를 기준으로 상세 정보를 확인할 수 있습니다."}
            </div>
          )}
          {loadError ? (
            <p className="mt-4 rounded-md bg-error-soft px-3 py-2 text-[13px] leading-5 text-error">
              {loadError}
            </p>
          ) : null}
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-2xl border border-hairline bg-surface p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <DetailRow
                label="지원 ID"
                value={
                  detail.applicationId != null
                    ? `#${detail.applicationId}`
                    : "-"
                }
              />
              <DetailRow label="계약서 ID" value={`#${contractId}`} />
              <DetailRow
                label="계약 유형"
                value={
                  detail.contractType
                    ? CONTRACT_TYPE_LABEL[detail.contractType]
                    : "-"
                }
              />
              <DetailRow
                label="보수 유형"
                value={detail.payType ? PAY_TYPE_LABEL[detail.payType] : "-"}
              />
              <DetailRow label="보수 금액" value={paymentText} />
              <DetailRow label="촬영 일정" value={detail.shootSchedule} />
              <DetailRow label="촬영 장소" value={detail.location} fullWidth />
              <DetailRow
                label="사용 범위"
                value={detail.usageScope}
                fullWidth
              />
              <DetailRow label="기타 조건" value={detail.memo} fullWidth />
              <DetailRow
                label="계약서 파일"
                value={
                  isModelUser && !hasViewedContract
                    ? "계약서 확인 버튼으로 열람하실 수 있습니다."
                    : getDocumentUrl(detail)
                      ? "열람 가능합니다."
                      : "아직 생성되지 않았습니다."
                }
                fullWidth
              />
              {detail.status === "REJECTED" ? (
                <DetailRow
                  label="거절 사유"
                  value={detail.rejectReason || "거절 사유가 없습니다."}
                  fullWidth
                />
              ) : null}
            </div>
          </section>

          <aside className="min-w-0 space-y-6">
            <section className="rounded-2xl border border-hairline bg-surface p-6">
              <h2 className="text-[18px] font-semibold leading-7 text-ink">
                다음 단계
              </h2>
              <ul className="mt-4 space-y-3 text-[14px] leading-6 text-body">
                <li>1. 계약서를 확인합니다.</li>
                <li>2. 필요하면 PDF를 열어 내용을 검토합니다.</li>
                <li>3. 계약에 동의하거나 거절 사유와 함께 거절합니다.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-hairline bg-surface p-6">
              <h2 className="text-[18px] font-semibold leading-7 text-ink">
                계약 액션
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {isModelUser ? (
                  <button
                    type="button"
                    onClick={handleViewContract}
                    disabled={isLoading || isViewingContract}
                    className="h-11 rounded-md border border-hairline bg-canvas-soft px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-hairline-strong disabled:text-mute"
                  >
                    {isViewingContract ? "계약서 확인 중" : "계약서 확인"}
                  </button>
                ) : null}

                <ContractNotifyButton
                  contractId={contractId}
                  applicationId={detail.applicationId}
                  initialStatus={detail.status}
                  initialPdfUrl={getDocumentUrl(detail)}
                />

                <ContractAgreementActions
                  contractId={contractId}
                  initialStatus={detail.status}
                  hasViewedContract={hasViewedContract}
                  onStatusChange={({ status, rejectReason, signedPdfUrl }) => {
                    setDetail((prev) => ({
                      ...prev,
                      status,
                      rejectReason,
                      signedPdfUrl: signedPdfUrl || prev.signedPdfUrl,
                    }));
                  }}
                />
              </div>
            </section>

            {detail.applicationId != null ? (
              <ContractStatusOverview
                key={`${detail.applicationId}-${detail.status}`}
                applicationId={detail.applicationId}
                initialStatus={detail.status}
                initialPdfUrl={getDocumentUrl(detail)}
              />
            ) : null}
          </aside>
        </section>
      </div>
    </main>
  );
}

function buildDetailFromQuery(
  query: ContractDetailContentProps["initialQuery"],
): DetailState {
  const paymentValue = Number(query.payment ?? "");

  return {
    applicationId: query.applicationId
      ? Number(query.applicationId)
      : undefined,
    contractType: isContractType(query.contractType)
      ? query.contractType
      : undefined,
    payType: isPayType(query.payType) ? query.payType : undefined,
    payment: Number.isNaN(paymentValue) ? undefined : paymentValue,
    shootSchedule:
      query.shootDate && query.shootStartTime && query.shootEndTime
        ? `${query.shootDate} ${query.shootStartTime} - ${query.shootEndTime}`
        : "-",
    location: query.location?.trim() || "-",
    usageScope: query.usageScope?.trim() || "-",
    memo: query.memo?.trim() || "없음",
    pdfUrl: query.pdfUrl?.trim() || "",
    signedPdfUrl: query.signedPdfUrl?.trim() || "",
    rejectReason: "",
    status: resolveContractStatus(query.status),
  };
}

function getDocumentUrl(detail: Pick<DetailState, "signedPdfUrl" | "pdfUrl">) {
  return detail.signedPdfUrl || detail.pdfUrl;
}

function formatSchedule(shootStartAt: string, shootEndAt: string) {
  const start = new Date(shootStartAt);
  const end = new Date(shootEndAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "-";
  }

  const date = start.toLocaleDateString("ko-KR");
  const startTime = start.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endTime = end.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return `${date} ${startTime} - ${endTime}`;
}

function isContractType(value?: string): value is "TEMPLATE" | "FILE" {
  return value === "TEMPLATE" || value === "FILE";
}

function isPayType(value?: string): value is "CASH" | "SERVICE" | "FREE" {
  return value === "CASH" || value === "SERVICE" || value === "FREE";
}

function resolveContractStatus(status?: string): ContractStatus {
  const statuses: ContractStatus[] = [
    "DRAFT",
    "NOTIFIED",
    "VIEWED",
    "AGREED",
    "REJECTED",
    "CONFIRMED",
    "CANCELLED",
  ];

  return statuses.includes(status as ContractStatus)
    ? (status as ContractStatus)
    : "DRAFT";
}

function DetailRow({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "space-y-1 md:col-span-2" : "space-y-1"}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.3px] text-mute">
        {label}
      </p>
      <p className="break-words rounded-xl bg-canvas-soft px-4 py-3 text-[15px] leading-6 text-ink">
        {value}
      </p>
    </div>
  );
}
