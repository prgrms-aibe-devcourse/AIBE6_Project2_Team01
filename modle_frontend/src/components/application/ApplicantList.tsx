"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { Toast, type ToastState } from "@/components/ui/Toast";
import { ReviewModal } from "@/components/review/ReviewModal";
import {
  APPLICATION_STATUS_LABELS,
  contactApplication,
  completeApplication,
  getApplicationContacts,
  type ApplicantInfo,
  type ContactHistory,
} from "@/lib/api/application";
import {
  formatContractStatus,
  getContractStatus,
  type ContractStatusResponse,
} from "@/lib/api/contract";

interface Props {
  applicants: ApplicantInfo[];
}

type ContractStatusModalState = {
  applicant: ApplicantInfo;
  data: ContractStatusResponse | null;
  error: string;
  loading: boolean;
};

export function ApplicantList({ applicants }: Props) {
  const [items, setItems] = useState(applicants);
  const [submittingIds, setSubmittingIds] = useState<Set<number>>(new Set());
  const [completingIds, setCompletingIds] = useState<Set<number>>(new Set());
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());
  const [loadingHistoryId, setLoadingHistoryId] = useState<number | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantInfo | null>(null);
  const [historyItems, setHistoryItems] = useState<ContactHistory[]>([]);
  const [historyError, setHistoryError] = useState("");
  const [reviewTarget, setReviewTarget] = useState<ApplicantInfo | null>(null);
  const [contractStatusModal, setContractStatusModal] =
    useState<ContractStatusModalState | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedStatusLabel = useMemo(() => {
    if (!selectedApplicant) return "";
    return APPLICATION_STATUS_LABELS[selectedApplicant.status] ?? selectedApplicant.status;
  }, [selectedApplicant]);

  function showToast(next: ToastState) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  async function handleContact(applicationId: number) {
    setSubmittingIds((prev) => new Set(prev).add(applicationId));
    try {
      const updated = await contactApplication(applicationId);
      setItems((prev) =>
        prev.map((item) =>
          item.applicationId === applicationId
            ? { ...item, status: updated.status, contacted: true }
            : item,
        ),
      );
      showToast({ type: "success", message: "지원자 컨택이 완료되었습니다." });
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "컨택에 실패했습니다.",
      });
    } finally {
      setSubmittingIds((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  }

  async function handleComplete(applicationId: number) {
    setCompletingIds((prev) => new Set(prev).add(applicationId));
    try {
      const updated = await completeApplication(applicationId);
      setItems((prev) =>
        prev.map((item) =>
          item.applicationId === applicationId
            ? { ...item, status: updated.status }
            : item,
        ),
      );
      showToast({ type: "success", message: "촬영 완료 처리됐습니다." });
    } catch (error) {
      showToast({
        type: "error",
        message: error instanceof Error ? error.message : "촬영 완료 처리에 실패했습니다.",
      });
    } finally {
      setCompletingIds((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  }

  async function handleOpenHistory(applicant: ApplicantInfo) {
    setSelectedApplicant(applicant);
    setHistoryError("");
    setHistoryItems([]);
    setLoadingHistoryId(applicant.applicationId);
    try {
      const histories = await getApplicationContacts(applicant.applicationId);
      setHistoryItems(histories);
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : "컨택 이력을 불러오지 못했습니다.",
      );
    } finally {
      setLoadingHistoryId(null);
    }
  }

  async function handleOpenContractStatus(applicant: ApplicantInfo) {
    setContractStatusModal({ applicant, data: null, error: "", loading: true });
    try {
      const status = await getContractStatus(applicant.applicationId);
      setContractStatusModal({ applicant, data: status, error: "", loading: false });
    } catch (error) {
      setContractStatusModal({
        applicant,
        data: null,
        error: error instanceof Error ? error.message : "계약 상태를 불러오지 못했습니다.",
        loading: false,
      });
    }
  }

  function closeHistory() {
    setSelectedApplicant(null);
    setHistoryItems([]);
    setHistoryError("");
    setLoadingHistoryId(null);
  }

  function handleReviewSuccess() {
    if (reviewTarget) {
      setReviewedIds((prev) => new Set(prev).add(reviewTarget.applicationId));
      showToast({ type: "success", message: "리뷰가 작성됐습니다." });
    }
    setReviewTarget(null);
  }

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
          아직 지원자가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      {toast ? <Toast toast={toast} /> : null}

      {/* 컨택 이력 모달 */}
      {selectedApplicant ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col border border-hairline bg-surface shadow-xl">
            <div className="flex items-start justify-between border-b border-hairline px-5 py-4">
              <div>
                <h2 className="text-[18px] font-bold text-ink">
                  {selectedApplicant.modelName} 컨택 이력
                </h2>
                <p className="mt-1 text-[13px] text-mute">상태: {selectedStatusLabel}</p>
              </div>
              <button
                type="button"
                onClick={closeHistory}
                className="text-[14px] font-medium text-mute transition hover:text-ink"
              >
                닫기
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              {loadingHistoryId === selectedApplicant.applicationId ? (
                <p className="py-10 text-center text-[14px] text-mute">불러오는 중입니다.</p>
              ) : historyError ? (
                <p className="py-10 text-center text-[14px] text-error">{historyError}</p>
              ) : historyItems.length === 0 ? (
                <p className="py-10 text-center text-[14px] text-mute">컨택 이력이 없습니다.</p>
              ) : (
                <ul className="space-y-3">
                  {historyItems.map((history) => (
                    <li key={history.id} className="border border-hairline bg-canvas px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[13px] font-semibold text-ink">메시지</span>
                        <span className="text-[12px] text-mute">
                          {new Date(history.sentAt).toLocaleString("ko-KR")}
                        </span>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-[14px] leading-6 text-ink">
                        {history.content}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* 리뷰 작성 모달 */}
      {reviewTarget ? (
        <ReviewModal
          applicationId={reviewTarget.applicationId}
          targetName={reviewTarget.modelName}
          onSuccess={handleReviewSuccess}
          onClose={() => setReviewTarget(null)}
        />
      ) : null}

      {/* 계약 상태 모달 */}
      {contractStatusModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col border border-hairline bg-surface shadow-xl">
            <div className="flex items-start justify-between border-b border-hairline px-5 py-4">
              <div>
                <h2 className="text-[18px] font-bold text-ink">
                  {contractStatusModal.applicant.modelName} 계약 상태
                </h2>
                <p className="mt-1 text-[13px] text-mute">
                  지원 ID #{contractStatusModal.applicant.applicationId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setContractStatusModal(null)}
                className="text-[14px] font-medium text-mute transition hover:text-ink"
              >
                닫기
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-4">
              {contractStatusModal.loading ? (
                <p className="py-10 text-center text-[14px] text-mute">
                  계약 상태를 불러오는 중입니다.
                </p>
              ) : contractStatusModal.error ? (
                <p className="py-10 text-center text-[14px] text-error">
                  {contractStatusModal.error}
                </p>
              ) : contractStatusModal.data ? (
                <div className="grid gap-3">
                  <ModalStatusRow
                    label="계약서 ID"
                    value={`#${contractStatusModal.data.contractId}`}
                  />
                  <ModalStatusRow
                    label="계약서 발송"
                    value={contractStatusModal.data.contractSent ? "완료" : "미발송"}
                  />
                  <ModalStatusRow
                    label="의뢰인 동의"
                    value={contractStatusModal.data.clientAgreed ? "완료" : "대기"}
                  />
                  <ModalStatusRow
                    label="모델 동의"
                    value={contractStatusModal.data.modelAgreed ? "완료" : "대기"}
                  />
                  <ModalStatusRow
                    label="계약 상태"
                    value={formatContractStatus(contractStatusModal.data.status)}
                  />
                  <ModalStatusRow
                    label="촬영 진행 가능"
                    value={contractStatusModal.data.shootingAvailable ? "가능" : "불가"}
                  />
                  <ModalStatusRow
                    label="PDF"
                    value={
                      contractStatusModal.data.pdfUrl
                        ? "생성 완료"
                        : "아직 생성되지 않았습니다."
                    }
                  />
                  {contractStatusModal.data.pdfUrl ? (
                    <a
                      href={contractStatusModal.data.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-10 items-center justify-center border border-black px-3 text-[13px] font-semibold text-black transition hover:bg-black hover:text-white"
                    >
                      PDF 열기
                    </a>
                  ) : null}
                  {contractStatusModal.data.status === "REJECTED" ? (
                    <ModalStatusRow
                      label="거절 사유"
                      value={contractStatusModal.data.rejectReason ?? "거절 사유가 없습니다."}
                      breakWords
                    />
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((applicant) => {
          const { applicationId, status } = applicant;
          const isSubmitting = submittingIds.has(applicationId);
          const isCompleting = completingIds.has(applicationId);
          const isReviewed = reviewedIds.has(applicationId);
          const canCheckContractStatus = status !== "APPLIED";

          return (
            <li key={applicationId} className="border border-gray-200 bg-white p-5">
              <Link
                href={`/models/${applicant.modelId}`}
                className="mb-4 flex items-center gap-3 transition-opacity hover:opacity-80"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  {applicant.profileImageUrl ? (
                    <Image
                      src={applicant.profileImageUrl}
                      alt={applicant.modelName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                      M
                    </div>
                  )}
                </div>
                <span className="text-[15px] font-bold text-black underline-offset-2 hover:underline">
                  {applicant.modelName}
                </span>
              </Link>

              <dl className="space-y-1.5 text-[13px]">
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-gray-400">지원 상태</dt>
                  <dd className="font-medium text-black">
                    {APPLICATION_STATUS_LABELS[status] ?? status}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-gray-400">컨택 여부</dt>
                  <dd className="font-medium text-black">{applicant.contacted ? "완료" : "-"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-gray-400">촬영 여부</dt>
                  <dd className="font-medium text-black">{applicant.shooting ? "진행" : "-"}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-gray-400">지원일</dt>
                  <dd className="text-gray-500">
                    {new Date(applicant.appliedDate).toLocaleDateString("ko-KR")}
                  </dd>
                </div>
                {applicant.coverLetter ? (
                  <div className="mt-2 border-t border-gray-100 pt-2">
                    <p className="line-clamp-3 text-[12px] text-gray-500">{applicant.coverLetter}</p>
                  </div>
                ) : null}
              </dl>

              {/* 상태별 액션 버튼 */}
              <div className="mt-4 space-y-2">
                {status === "APPLIED" && (
                  <button
                    type="button"
                    onClick={() => handleContact(applicationId)}
                    disabled={isSubmitting}
                    className="h-10 w-full border border-black px-3 text-[13px] font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "처리 중..." : "컨택하기"}
                  </button>
                )}
                {status === "CONTACTED" && (
                  <Link
                    href={`/contracts/new?applicationId=${applicationId}`}
                    className="flex h-10 items-center justify-center border border-black bg-black px-3 text-[13px] font-semibold text-white transition hover:opacity-85"
                  >
                    계약서 발송
                  </Link>
                )}
                {status === "CONTRACT_SENT" && (
                  <button
                    type="button"
                    disabled
                    className="h-10 w-full cursor-not-allowed border border-gray-200 bg-gray-100 px-3 text-[13px] font-semibold text-gray-400"
                  >
                    계약 검토 중
                  </button>
                )}
                {status === "SHOOTING" && (
                  <button
                    type="button"
                    onClick={() => handleComplete(applicationId)}
                    disabled={isCompleting}
                    className="h-10 w-full border border-black bg-black px-3 text-[13px] font-semibold text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCompleting ? "처리 중..." : "촬영 완료"}
                  </button>
                )}
                {status === "COMPLETED" && (
                  <div className="flex gap-2">
                    <span className="flex h-10 flex-1 items-center justify-center border border-gray-200 bg-gray-50 text-[13px] font-semibold text-gray-500">
                      완료
                    </span>
                    <button
                      type="button"
                      onClick={() => setReviewTarget(applicant)}
                      disabled={isReviewed}
                      className="flex h-10 flex-1 items-center justify-center border border-black px-3 text-[13px] font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {isReviewed ? "리뷰 완료" : "리뷰 작성"}
                    </button>
                  </div>
                )}

                {/* 이력 보기 (항상 노출) */}
                <button
                  type="button"
                  onClick={() => handleOpenHistory(applicant)}
                  disabled={loadingHistoryId === applicationId}
                  className="h-9 w-full border border-gray-300 px-3 text-[13px] font-semibold text-gray-700 transition hover:border-black hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingHistoryId === applicationId ? "불러오는 중..." : "이력 보기"}
                </button>

                {/* 계약 상태 보기 (APPLIED 제외) */}
                {canCheckContractStatus ? (
                  <button
                    type="button"
                    onClick={() => handleOpenContractStatus(applicant)}
                    className="h-9 w-full border border-gray-300 px-3 text-[13px] font-semibold text-gray-700 transition hover:border-black hover:text-black"
                  >
                    계약 상태 보기
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function ModalStatusRow({
  label,
  value,
  breakWords = false,
}: {
  label: string;
  value: string;
  breakWords?: boolean;
}) {
  return (
    <div className="rounded-xl bg-canvas px-4 py-3">
      <p className="text-[12px] font-semibold text-mute">{label}</p>
      <p className={`mt-1 text-[14px] leading-6 text-ink ${breakWords ? "break-all" : ""}`}>
        {value}
      </p>
    </div>
  );
}
