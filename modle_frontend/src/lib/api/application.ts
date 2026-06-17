import { API_BASE_URL, authenticatedFetch } from "./client";
import { getErrorMessage } from "./error";

export type ApplicationResponse = {
  id: number;
  jobPostingId: number;
  modelId: number;
  coverLetter: string | null;
  status: string;
  createdDate: string;
};

export async function applyToJob(
  jobPostingId: number,
  coverLetter: string
): Promise<ApplicationResponse> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/jobs/${jobPostingId}/apply`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ coverLetter }),
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, "지원에 실패했습니다."));
  }
  const body = await res.json();
  return body.data as ApplicationResponse;
}

export async function cancelApplication(
  applicationId: number
): Promise<ApplicationResponse> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/applications/${applicationId}/cancel`,
    {
      method: "PATCH",
      credentials: "include",
    }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, "지원 취소에 실패했습니다."));
  }
  const body = await res.json();
  return body.data as ApplicationResponse;
}
