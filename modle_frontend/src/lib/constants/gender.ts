// 백엔드 Model.gender(boolean)의 의미가 코드/문서에 정의되어 있지 않아 프론트에서 임의로 가정함.
// true = 남성, false = 여성. (백엔드와 추후 확인 필요)
export const GENDER_OPTIONS = [
  { value: true, label: '남성' },
  { value: false, label: '여성' },
] as const
