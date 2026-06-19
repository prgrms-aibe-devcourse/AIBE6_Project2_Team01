import { API_BASE_URL, authenticatedFetch } from "./client";
import { getErrorMessage } from "./error";

export type ReviewResponse = {
  id: number;
  applicationId: number;
  reviewerId: number;
  targetId: number;
  reviewerRole: string;
  rating: number;
  content: string;
  createdDate: string;
};

export async function createReview(
  applicationId: number,
  rating: number,
  content: string,
): Promise<ReviewResponse> {
  const res = await authenticatedFetch(`${API_BASE_URL}/api/v1/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ applicationId, rating, content }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, "리뷰 작성에 실패했습니다."));
  }
  const body = await res.json();
  return body.data as ReviewResponse;
}

export async function getReviews(targetUserId: number): Promise<ReviewResponse[]> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/reviews/users/${targetUserId}/reviews`,
    { credentials: "include" },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, "리뷰 목록을 불러오지 못했습니다."));
  }
  const body = await res.json();
  return body.data as ReviewResponse[];
}
