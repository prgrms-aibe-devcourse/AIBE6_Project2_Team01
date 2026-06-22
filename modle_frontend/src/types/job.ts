import type { components } from "@/lib/api/schema";

// 공고 목록 카드(JobCard) 등에서 사용하는 공고 목록 항목 타입.
// 백엔드 JobPostingListResponse 스키마를 단일 출처로 재사용한다.
export type JobListItem = components["schemas"]["JobPostingListResponse"];
