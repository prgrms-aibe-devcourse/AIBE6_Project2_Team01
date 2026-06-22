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

export function getCategoryLabel(value: string | undefined | null): string {
  if (!value) return "선택 안됨";
  const option = CATEGORY_OPTIONS.find((opt) => opt.value === value);
  return option ? option.label : value;
}
