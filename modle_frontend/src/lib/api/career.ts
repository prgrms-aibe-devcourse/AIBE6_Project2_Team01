import { API_BASE_URL, authenticatedFetch } from "./client";
import { getErrorMessage } from "./error";

export type CareerItem = {
  id: number;
  jobPostingId: number | null;
  title: string;
  category: string;
  region: string;
  shootDate: string | null;
  completedDate: string | null;
  isPublic: boolean;
};

export async function getMyCareer(): Promise<CareerItem[]> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/v1/careers/my`, {
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, "경력 목록을 불러오지 못했습니다."));
  }
  const body = await res.json();
  return body.data as CareerItem[];
}

export async function getPublicCareer(modelId: number): Promise<CareerItem[]> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/models/${modelId}/careers`,
    { credentials: "include" },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, "경력 정보를 불러오지 못했습니다."));
  }
  const body = await res.json();
  return body.data as CareerItem[];
}

export async function updateCareerPublic(
  careerId: number,
  isPublic: boolean,
): Promise<CareerItem> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/careers/${careerId}/public?isPublic=${isPublic}`,
    { method: "PATCH", credentials: "include" },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, "공개 여부 변경에 실패했습니다."));
  }
  const body = await res.json();
  return body.data as CareerItem;
}
