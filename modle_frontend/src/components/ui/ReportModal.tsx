"use client";

import { useState } from "react";
import { createReport, REASON_LABELS } from "@/lib/api/report";
import type { ReportReason, ReportTargetType } from "@/lib/api/report";

const REASONS = Object.entries(REASON_LABELS) as [ReportReason, string][];

interface Props {
  targetType: ReportTargetType;
  targetId: number;
  onClose: () => void;
}

export function ReportModal({ targetType, targetId, onClose }: Props) {
  const [reason, setReason] = useState<ReportReason>("SPAM");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");
    try {
      await createReport({
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });
      setStatus("done");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "신고 접수에 실패했습니다.");
      setStatus("error");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[400px] rounded-xl border border-hairline bg-surface p-6 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {status === "done" ? (
          <div className="text-center">
            <p className="text-lg font-semibold text-ink">신고가 접수되었습니다.</p>
            <p className="mt-2 text-[13px] text-body">검토 후 조치하겠습니다.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 h-10 w-full rounded-md bg-primary text-[14px] font-semibold text-on-primary transition hover:bg-primary-hover"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">신고하기</h2>
              <button
                type="button"
                onClick={onClose}
                className="text-mute transition hover:text-ink"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <p className="mb-2 text-[13px] font-semibold text-ink">신고 사유</p>
                <div className="flex flex-col gap-2">
                  {REASONS.map(([value, label]) => (
                    <label key={value} className="flex cursor-pointer items-center gap-2.5">
                      <input
                        type="radio"
                        name="reason"
                        value={value}
                        checked={reason === value}
                        onChange={() => setReason(value)}
                        className="accent-primary"
                      />
                      <span className="text-[14px] text-ink">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-ink">
                  추가 설명{" "}
                  <span className="font-normal text-mute">(선택)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="구체적인 내용을 입력하면 빠른 처리에 도움이 됩니다."
                  className="w-full resize-none rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-[14px] leading-6 text-ink outline-none transition focus:border-ink"
                />
                <p className="mt-1 text-right text-[11px] text-mute">
                  {description.length} / 500
                </p>
              </div>
              {status === "error" && (
                <p className="rounded-md bg-error-soft px-3 py-2 text-[13px] text-error">
                  {errorMessage}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 flex-1 rounded-md border border-hairline bg-surface text-[14px] font-semibold text-ink transition hover:border-hairline-strong"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="h-10 flex-1 rounded-md bg-error px-4 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                >
                  {status === "submitting" ? "접수 중..." : "신고 접수"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
