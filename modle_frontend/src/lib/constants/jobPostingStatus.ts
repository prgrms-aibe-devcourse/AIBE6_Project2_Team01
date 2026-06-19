export const STATUS_LABELS: Record<string, string> = {
  RECRUITING: "모집 중",
  SHOOTING: "촬영 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
  ON_HOLD: "보류",
  CLOSED: "마감",
};

export const STATUS_COLORS: Record<string, string> = {
  RECRUITING: "bg-green-100 text-green-700",
  SHOOTING: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-gray-100 text-gray-600",
  CANCELLED: "bg-red-100 text-red-600",
  ON_HOLD: "bg-amber-100 text-amber-700",
  CLOSED: "bg-slate-200 text-slate-600",
};

// 상태 변경 카드에서만 사용하는 레이블 (뱃지 표시와 별개)
export const STATUS_TRANSITION_LABELS: Record<string, string> = {
  RECRUITING: "재모집",
};

export const STATUS_CHANGE_DESCRIPTIONS: Record<string, string> = {
  SHOOTING: "모델과 촬영을 시작합니다.",
  COMPLETED: "모든 촬영이 완료되었습니다.",
  CANCELLED: "공고를 취소합니다. 진행이 불가한 경우 사용하며 되돌릴 수 없습니다.",
  ON_HOLD: "촬영을 일시 중단합니다. 이후 재개하거나 재모집할 수 있습니다.",
  CLOSED: "모집을 정상 종료합니다. 취소와 달리 이상 없이 마무리된 경우입니다.",
  RECRUITING: "다시 모델 지원을 받습니다.",
};

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  RECRUITING: ["SHOOTING", "CANCELLED", "ON_HOLD", "CLOSED"],
  SHOOTING: ["COMPLETED", "CANCELLED", "ON_HOLD"],
  ON_HOLD: ["SHOOTING", "RECRUITING", "CANCELLED", "CLOSED"],
};
