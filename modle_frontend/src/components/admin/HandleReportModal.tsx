"use client";

import { useState } from "react";
import type { AdminReportReason, AdminReportTargetType, ReportItem } from "@/lib/api/admin";

const TARGET_TYPE_LABELS: Record<AdminReportTargetType, string> = {
  JOB_POSTING: "공고",
  PROFILE: "프로필",
  MESSAGE: "쪽지",
};

const REASON_LABELS: Record<AdminReportReason, string> = {
  SPAM: "스팸",
  INAPPROPRIATE: "부적절한 콘텐츠",
  FRAUD: "사기",
  HARASSMENT: "괴롭힘",
  OTHER: "기타",
};

const MAX_REASON_LENGTH = 500;

type Props = {
  report: ReportItem;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (accepted: boolean, dismissReason?: string) => void;
};

export function HandleReportModal({ report, isSubmitting, onClose, onConfirm }: Props) {
  const [accepted, setAccepted] = useState<boolean | null>(null);
  const [dismissReason, setDismissReason] = useState("");

  const canSubmit =
    accepted !== null &&
    (accepted || dismissReason.trim().length > 0) &&
    !isSubmitting;

  const handleConfirm = () => {
    if (accepted === null) return;
    onConfirm(accepted, accepted ? undefined : dismissReason.trim() || undefined);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-xl">
        <h3 className="text-[17px] font-bold leading-6 text-ink">신고 처리</h3>

        {/* 신고 요약 */}
        <div className="mt-4 rounded-md bg-canvas-soft px-4 py-3 text-[13px] leading-5 space-y-1.5">
          <div className="flex gap-3">
            <span className="w-12 shrink-0 text-mute">유형</span>
            <span className="font-medium text-ink">
              {TARGET_TYPE_LABELS[report.targetType] ?? report.targetType}
            </span>
          </div>
          <div className="flex gap-3">
            <span className="w-12 shrink-0 text-mute">사유</span>
            <span className="font-medium text-ink">
              {REASON_LABELS[report.reason] ?? report.reason}
            </span>
          </div>
          {report.description && (
            <div className="flex gap-3">
              <span className="w-12 shrink-0 text-mute">내용</span>
              <span className="text-body line-clamp-3">{report.description}</span>
            </div>
          )}
        </div>

        {/* 처리 방식 선택 */}
        <fieldset className="mt-5">
          <legend className="text-[14px] font-semibold text-ink mb-3">처리 방식</legend>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-3 cursor-pointer select-none rounded-md border border-hairline p-3 hover:bg-canvas-soft transition has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
              <input
                type="radio"
                name="accepted"
                checked={accepted === true}
                onChange={() => setAccepted(true)}
                disabled={isSubmitting}
                className="accent-primary"
              />
              <div>
                <p className="text-[14px] font-semibold text-ink">수락 — 경고 처리</p>
                <p className="text-[12px] text-mute mt-0.5">신고를 인정하고 대상에게 경고를 부여합니다.</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none rounded-md border border-hairline p-3 hover:bg-canvas-soft transition has-[:checked]:border-primary has-[:checked]:bg-primary-soft">
              <input
                type="radio"
                name="accepted"
                checked={accepted === false}
                onChange={() => setAccepted(false)}
                disabled={isSubmitting}
                className="accent-primary"
              />
              <div>
                <p className="text-[14px] font-semibold text-ink">거절 — 신고 반려</p>
                <p className="text-[12px] text-mute mt-0.5">신고를 인정하지 않고 반려합니다. 사유를 입력해야 합니다.</p>
              </div>
            </label>
          </div>
        </fieldset>

        {/* 거절 사유 입력 */}
        {accepted === false && (
          <div className="mt-4">
            <label className="block text-[13px] font-semibold text-ink mb-1.5">
              거절 사유 <span className="text-error">*</span>
            </label>
            <textarea
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value.slice(0, MAX_REASON_LENGTH))}
              rows={3}
              disabled={isSubmitting}
              placeholder="거절 사유를 입력해주세요."
              className="w-full resize-none rounded-md border border-hairline-strong p-3 text-[14px] leading-6 text-ink focus:border-ink focus:outline-none disabled:opacity-50"
            />
            <p className="mt-1 text-right text-[12px] text-mute">
              {dismissReason.length} / {MAX_REASON_LENGTH}
            </p>
          </div>
        )}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-11 rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canSubmit}
            className="h-11 rounded-md bg-primary px-5 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? "처리 중..." : "처리 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
