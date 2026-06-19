"use client";

interface NotificationSection {
  key: string;
  label: string;
}

const CLIENT_SECTIONS: NotificationSection[] = [
  { key: "apply", label: "공고" },
  { key: "message", label: "쪽지" },
  { key: "report", label: "신고" },
];

const MODEL_SECTIONS: NotificationSection[] = [
  { key: "message", label: "쪽지" },
  { key: "report", label: "신고" },
];

type Props = {
  role: "MODEL" | "CLIENT";
  onClose: () => void;
};

export function NotificationPanel({ role, onClose }: Props) {
  const sections = role === "CLIENT" ? CLIENT_SECTIONS : MODEL_SECTIONS;

  return (
    <div className="absolute right-0 top-full mt-2 w-80 rounded-lg border border-hairline bg-surface shadow-xl z-50">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-hairline">
        <h3 className="text-[15px] font-bold text-ink">알림</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="알림 닫기"
          className="flex h-6 w-6 items-center justify-center rounded text-mute hover:text-ink transition"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M1 1l12 12M13 1L1 13" />
          </svg>
        </button>
      </div>

      {/* 알림 섹션 목록 */}
      <div className="divide-y divide-hairline max-h-[400px] overflow-y-auto">
        {sections.map((section) => (
          <div key={section.key} className="px-4 py-3">
            <p className="text-[11px] font-bold text-mute uppercase tracking-widest mb-2">
              {section.label}
            </p>
            <div className="flex items-center justify-center py-4 rounded-md bg-canvas-soft">
              <p className="text-[13px] text-mute">알림이 없습니다.</p>
            </div>
          </div>
        ))}
      </div>

      {/* 푸터 */}
      <div className="px-4 py-2.5 border-t border-hairline bg-canvas-soft rounded-b-lg text-center">
        <span className="text-[12px] text-mute">
          알림 기능은 준비 중입니다.
        </span>
      </div>
    </div>
  );
}
