'use client';

type Props = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  isLoading = false,
  onConfirm,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-lg border border-hairline bg-surface p-6 shadow-xl">
        <h3 className="text-[17px] font-bold leading-6 text-ink">{title}</h3>
        {description && (
          <p className="mt-2 text-[14px] leading-6 text-mute">{description}</p>
        )}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="h-10 rounded-md border border-hairline-strong bg-surface px-4 text-[14px] font-semibold text-ink transition hover:border-ink disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="h-10 rounded-md bg-error px-4 text-[14px] font-semibold text-white transition hover:opacity-80 disabled:opacity-50"
          >
            {isLoading ? '처리 중...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
