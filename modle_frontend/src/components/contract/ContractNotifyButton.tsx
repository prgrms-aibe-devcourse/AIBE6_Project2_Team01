"use client";

import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import {
  createContractPdf,
  notifyContract,
  type ContractStatus,
} from "@/lib/api/contract";

type ContractNotifyButtonProps = {
  contractId: number;
  initialStatus: ContractStatus;
  initialPdfUrl?: string;
};

export function ContractNotifyButton({
  contractId,
  initialStatus,
  initialPdfUrl = "",
}: ContractNotifyButtonProps) {
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState<ContractStatus>(initialStatus);
  const [pdfUrl, setPdfUrl] = useState(initialPdfUrl);
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "pdf" | "notify" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  if (isLoading || user?.role !== "CLIENT") {
    return null;
  }

  const isDraft = status === "DRAFT";
  const canNotify = isDraft && Boolean(pdfUrl);
  const isSubmitting = requestStatus === "pdf" || requestStatus === "notify";

  const handleCreatePdf = async () => {
    setRequestStatus("pdf");
    setMessage("");

    try {
      const result = await createContractPdf(contractId);
      setPdfUrl(result.pdfUrl);
      setStatus(result.status);
      setRequestStatus("success");
      setMessage("PDF가 생성되었습니다. 내용을 확인한 뒤 모델에게 발송해주세요.");
    } catch (error) {
      setRequestStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "계약서 PDF를 생성하지 못했습니다.",
      );
    }
  };

  const handleNotify = async () => {
    setRequestStatus("notify");
    setMessage("");

    try {
      const contract = await notifyContract(contractId);
      setStatus(contract.status);
      setRequestStatus("success");
      setMessage("계약서가 모델에게 발송되었습니다.");
    } catch (error) {
      setRequestStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "계약서를 발송하지 못했습니다.",
      );
    }
  };

  return (
    <div className="space-y-3">
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 w-full items-center justify-center rounded-md border border-hairline bg-canvas-soft px-4 text-[14px] font-semibold text-ink transition hover:border-hairline-strong"
        >
          PDF 미리보기
        </a>
      ) : null}

      {isDraft && !pdfUrl ? (
        <button
          type="button"
          disabled={isSubmitting}
          onClick={handleCreatePdf}
          className="h-11 w-full rounded-md bg-primary px-4 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
        >
          {requestStatus === "pdf" ? "PDF 생성 중" : "PDF 생성"}
        </button>
      ) : null}

      {isDraft ? (
        <button
          type="button"
          disabled={!canNotify || isSubmitting}
          onClick={handleNotify}
          className="h-11 w-full rounded-md bg-primary px-4 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
        >
          {requestStatus === "notify" ? "발송 중" : "모델에게 발송"}
        </button>
      ) : (
        <p className="rounded-md bg-canvas-soft px-3 py-2 text-[13px] leading-5 text-body">
          현재 상태: {status}
        </p>
      )}

      {isDraft && !pdfUrl ? (
        <p className="rounded-md bg-canvas-soft px-3 py-2 text-[13px] leading-5 text-body">
          PDF 생성 후 모델에게 발송할 수 있습니다.
        </p>
      ) : null}

      {message ? (
        <p
          className={`rounded-md px-3 py-2 text-[13px] leading-5 ${
            requestStatus === "error"
              ? "bg-error-soft text-error"
              : "bg-success-soft text-success"
          }`}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
