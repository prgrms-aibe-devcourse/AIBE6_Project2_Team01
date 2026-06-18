"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import {
  agreeContract,
  rejectContract,
  viewContract,
  type ContractStatus,
} from "@/lib/api/contract";

type ContractAgreementActionsProps = {
  contractId: number;
  initialStatus: ContractStatus;
};

export function ContractAgreementActions({
  contractId,
  initialStatus,
}: ContractAgreementActionsProps) {
  const { user, isLoading } = useAuth();
  const [status, setStatus] = useState<ContractStatus>(initialStatus);
  const [requestStatus, setRequestStatus] = useState<
    "idle" | "loading" | "agree" | "reject" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isLoading || user?.role !== "MODEL") {
      return;
    }

    let ignore = false;

    async function loadContractStatus() {
      setRequestStatus("loading");
      setMessage("");

      try {
        const contract = await viewContract(contractId);

        if (ignore) {
          return;
        }

        setStatus(contract.status);
        setRequestStatus("idle");
      } catch (error) {
        if (ignore) {
          return;
        }

        setRequestStatus("error");
        setMessage(
          error instanceof Error
            ? error.message
            : "계약 정보를 조회하지 못했습니다.",
        );
      }
    }

    void loadContractStatus();

    return () => {
      ignore = true;
    };
  }, [contractId, isLoading, user?.role]);

  if (isLoading || user?.role !== "MODEL") {
    return null;
  }

  const canRespond =
    status === "NOTIFIED" || status === "VIEWED" || status === "AGREED";
  const isSubmitting =
    requestStatus === "loading" ||
    requestStatus === "agree" ||
    requestStatus === "reject";

  const handleAgree = async () => {
    setRequestStatus("agree");
    setMessage("");

    try {
      const contract = await agreeContract(contractId);
      setStatus(contract.status);
      setRequestStatus("success");
      setMessage(
        contract.status === "CONFIRMED"
          ? "계약이 확정되었습니다."
          : "계약 동의가 완료되었습니다.",
      );
    } catch (error) {
      setRequestStatus("error");
      setMessage(
        error instanceof Error ? error.message : "계약 동의에 실패했습니다.",
      );
    }
  };

  const handleReject = async () => {
    setRequestStatus("reject");
    setMessage("");

    try {
      const contract = await rejectContract(contractId);
      setStatus(contract.status);
      setRequestStatus("success");
      setMessage("계약을 거절했습니다.");
    } catch (error) {
      setRequestStatus("error");
      setMessage(
        error instanceof Error ? error.message : "계약 거절에 실패했습니다.",
      );
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!canRespond || isSubmitting}
          onClick={handleAgree}
          className="h-11 rounded-md bg-primary px-4 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:bg-canvas-soft disabled:text-mute"
        >
          {requestStatus === "loading"
            ? "확인 중"
            : requestStatus === "agree"
              ? "동의 중"
              : "동의"}
        </button>
        <button
          type="button"
          disabled={!canRespond || isSubmitting}
          onClick={handleReject}
          className="h-11 rounded-md border border-hairline bg-canvas-soft px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-hairline-strong disabled:text-mute"
        >
          {requestStatus === "loading"
            ? "확인 중"
            : requestStatus === "reject"
              ? "거절 중"
              : "거절"}
        </button>
      </div>

      {!canRespond ? (
        <p className="rounded-md bg-canvas-soft px-3 py-2 text-[13px] leading-5 text-body">
          현재 상태: {status}
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
