export const JOB_STATUS_OPTIONS = [
  { value: "RECRUITING", label: "모집중" },
  { value: "SHOOTING", label: "촬영중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELLED", label: "취소" },
  { value: "ON_HOLD", label: "보류" },
  { value: "CLOSED", label: "마감" },
] as const;

// 공고 상태 enum 값을 한글 라벨로 변환 (매칭 없으면 원래 값 반환)
export function getJobStatusLabel(value?: string | null): string {
  return JOB_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value ?? "";
}
