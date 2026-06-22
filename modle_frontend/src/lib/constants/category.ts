export const CATEGORY_OPTIONS = [
  { value: "HAIR", label: "헤어" },
  { value: "MAKEUP", label: "메이크업" },
  { value: "CLOTHING", label: "의류" },
  { value: "FITTING", label: "피팅" },
  { value: "HAND", label: "핸드" },
  { value: "FOOD", label: "음식" },
  { value: "PRODUCT", label: "제품" },
  { value: "ETC", label: "기타" },
] as const;

// 카테고리 enum 값을 한글 라벨로 변환 (매칭 없으면 원래 값 반환)
export function getCategoryLabel(value?: string | null): string {
  return CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value ?? "";
}
