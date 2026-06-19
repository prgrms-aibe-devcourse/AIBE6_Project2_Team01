"use client";

import { useEffect, useState } from "react";

import {
  formatContractStatus,
  getContractStatus,
  type ContractStatus,
  type ContractStatusResponse,
} from "@/lib/api/contract";

type ContractStatusOverviewProps = {
  applicationId: number;
  initialStatus: ContractStatus;
  initialPdfUrl?: string;
};

export function ContractStatusOverview({
  applicationId,
  initialStatus,
  initialPdfUrl = "",
}: ContractStatusOverviewProps) {
  const [contractStatus, setContractStatus] = useState<ContractStatusResponse>({
    contractId: 0,
    applicationId,
    contractSent: initialStatus !== "DRAFT",
    status: initialStatus,
    clientAgreed: initialStatus !== "DRAFT",
    modelAgreed: initialStatus === "CONFIRMED" || initialStatus === "AGREED",
    pdfUrl: initialPdfUrl || null,
    rejectReason: null,
    shootingAvailable: initialStatus === "CONFIRMED",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadContractStatus() {
      try {
        const response = await getContractStatus(applicationId);

        if (ignore) {
          return;
        }

        setContractStatus(response);
        setError("");
      } catch (loadError) {
        if (ignore) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "계약 상태를 조회하지 못했습니다.",
        );
      }
    }

    void loadContractStatus();

    return () => {
      ignore = true;
    };
  }, [applicationId]);

  return (
    <section className="min-w-0 rounded-2xl border border-hairline bg-surface p-6">
      <h2 className="text-[18px] font-semibold leading-7 text-ink">
        계약 상태
      </h2>

      <div className="mt-4 grid gap-3">
        <StatusRow label="계약 발송" value={contractStatus.contractSent ? "완료" : "미발송"} />
        <StatusRow
          label="클라이언트 동의"
          value={contractStatus.clientAgreed ? "완료" : "대기"}
        />
        <StatusRow
          label="모델 동의"
          value={contractStatus.modelAgreed ? "완료" : "대기"}
        />
        <StatusRow
          label="계약 상태"
          value={formatContractStatus(contractStatus.status)}
        />
        <StatusRow
          label="촬영 진행 가능"
          value={contractStatus.shootingAvailable ? "가능" : "불가"}
        />
        <StatusRow
          label="계약서 파일"
          value={contractStatus.pdfUrl ? "열람 가능" : "아직 생성되지 않았습니다."}
        />
        {contractStatus.status === "REJECTED" ? (
          <StatusRow
            label="거절 사유"
            value={contractStatus.rejectReason ?? "거절 사유가 없습니다."}
            breakWords
          />
        ) : null}
      </div>

      {error ? (
        <p className="mt-4 rounded-md bg-error-soft px-3 py-2 text-[13px] leading-5 text-error">
          {error}
        </p>
      ) : null}
    </section>
  );
}

function StatusRow({
  label,
  value,
  breakWords = false,
}: {
  label: string;
  value: string;
  breakWords?: boolean;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-canvas-soft px-4 py-3">
      <p className="text-[12px] font-semibold text-mute">{label}</p>
      <p
        className={`mt-1 min-w-0 text-[14px] leading-6 text-ink ${
          breakWords ? "break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
