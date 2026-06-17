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

export async function checkApplyStatus(jobPostingId: number): Promise<boolean> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/jobs/${jobPostingId}/apply-status`,
    { credentials: "include" }
  );
  if (!res.ok) return false;
  const body = await res.json();
  return body?.data === true;
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

// ── 공유 상수 ───────────────────────────────────────────────
export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  APPLIED: '지원 완료',
  CONTACTED: '컨택 완료',
  CONTRACT_SENT: '계약서 발송',
  SHOOTING: '촬영 진행',
  SHOOTING_CANCELLED: '촬영 취소',
  ON_HOLD: '보류',
  COMPLETED: '완료',
  REJECTED: '거절',
  APPLICATION_CANCELLED: '지원 취소',
};

// ── MATCH-004: 지원자 목록 (의뢰인) ─────────────────────────
export type ApplicantInfo = {
  applicationId: number;
  modelId: number;
  modelName: string;
  profileImageUrl: string | null;
  coverLetter: string | null;
  status: string;
  contacted: boolean;
  shooting: boolean;
  appliedDate: string;
};

export async function getApplicants(jobId: number): Promise<ApplicantInfo[]> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/jobs/${jobId}/applicants`,
    { credentials: 'include' }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const err = new Error(getErrorMessage(body, '지원자 목록을 불러오는데 실패했습니다.')) as Error & { status: number };
    err.status = res.status;
    throw err;
  }
  const body = await res.json();
  return body.data as ApplicantInfo[];
}

// ── MATCH-005: 지원한 공고 목록 (모델) ──────────────────────
export type MyApplication = {
  applicationId: number;
  jobPostingId: number;
  jobPostingTitle: string;
  category: string;
  region: string;
  status: string;
  shooting: boolean;
  appliedDate: string;
};

export async function getMyApplications(): Promise<MyApplication[]> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/applications/my`,
    { credentials: 'include' }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, '지원한 공고 목록을 불러오는데 실패했습니다.'));
  }
  const body = await res.json();
  return body.data as MyApplication[];
}

// ── MATCH-006: 작성한 공고 목록 (의뢰인) ────────────────────
export type MyJobPosting = {
  jobPostingId: number;
  title: string;
  category: string;
  region: string;
  status: string;
  applicantCount: number;
  contactedCount: number;
  completedCount: number;
  createdDate: string;
};

export async function getMyJobPostings(): Promise<MyJobPosting[]> {
  const res = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/jobs/my`,
    { credentials: 'include' }
  );
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, '등록한 공고 목록을 불러오는데 실패했습니다.'));
  }
  const body = await res.json();
  return body.data as MyJobPosting[];
}
