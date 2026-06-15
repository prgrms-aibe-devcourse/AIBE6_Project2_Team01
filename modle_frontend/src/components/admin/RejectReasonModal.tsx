"use client";

import { useState } from "react";

const MAX_REASON_LENGTH = 200;

type Props = {
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
};

export function RejectReasonModal({ isSubmitting, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-xl">
        <h3 className="text-[17px] font-bold leading-6 text-ink">반려 사유 입력</h3>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, MAX_REASON_LENGTH))}
          rows={4}
          disabled={isSubmitting}
          placeholder="반려 사유를 입력해주세요."
          className="mt-4 w-full resize-none rounded-md border border-hairline-strong p-3 text-[15px] leading-6 text-ink focus:border-ink focus:outline-none disabled:opacity-50"
        />
        <p className="mt-1 text-right text-[13px] leading-5 text-mute">
          {reason.length} / {MAX_REASON_LENGTH}
        </p>

        <div className="mt-4 flex justify-end gap-3">
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
            disabled={isSubmitting || !reason.trim()}
            className="h-11 rounded-md bg-primary px-4 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? "처리 중..." : "반려"}
          </button>
        </div>
      </div>
    </div>
  );
}
