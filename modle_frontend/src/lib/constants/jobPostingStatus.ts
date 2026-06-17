export const STATUS_LABELS: Record<string, string> = {
  RECRUITING: "모집 중",
  SHOOTING: "촬영 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
  ON_HOLD: "일시정지",
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

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  RECRUITING: ["SHOOTING", "CANCELLED", "ON_HOLD", "CLOSED"],
  SHOOTING: ["COMPLETED", "CANCELLED", "ON_HOLD"],
  ON_HOLD: ["RECRUITING", "CANCELLED", "CLOSED"],
};
