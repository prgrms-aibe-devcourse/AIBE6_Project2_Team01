import { API_BASE_URL, authenticatedFetch, client } from "./client";
import { getErrorMessage } from "./error";
import type { components } from "./schema";

export type PendingClient = components["schemas"]["PendingClientResponse"];

// ─── 신고 관련 타입 ───────────────────────────────────────────────
export type AdminReportTargetType = "JOB_POSTING" | "PROFILE" | "MESSAGE";
export type AdminReportReason = "SPAM" | "INAPPROPRIATE" | "FRAUD" | "HARASSMENT" | "OTHER";
export type AdminReportStatus = "PENDING" | "ACTIONED" | "DISMISSED";

export interface ReportItem {
  id: number;
  reporterId: number;
  targetType: AdminReportTargetType;
  targetId: number;
  reason: AdminReportReason;
  description?: string;
  status: AdminReportStatus;
  dismissReason?: string;
  createdDate: string;
}

export interface ReportPageResult {
  content: ReportItem[];
  totalElements: number;
  totalPages: number;
  number: number;
}

// ─── 의뢰인 승인 ─────────────────────────────────────────────────
export async function getPendingClients(): Promise<PendingClient[]> {
  const { data, error } = await client.GET("/api/v1/admin/clients/pending");

  if (error) {
    throw new Error(getErrorMessage(error, "승인 대기 목록을 불러오는데 실패했습니다."));
  }

  return data?.data ?? [];
}

export async function approveClient(userId: number): Promise<void> {
  const { error } = await client.PATCH("/api/v1/admin/clients/{userId}/approve", {
    params: { path: { userId } },
  });

  if (error) {
    throw new Error(getErrorMessage(error, "승인 처리에 실패했습니다."));
  }
}

export async function rejectClient(userId: number, reason: string): Promise<void> {
  const { error } = await client.PATCH("/api/v1/admin/clients/{userId}/reject", {
    params: { path: { userId } },
    body: { reason },
  });

  if (error) {
    throw new Error(getErrorMessage(error, "반려 처리에 실패했습니다."));
  }
}

// ─── 신고 관리 ────────────────────────────────────────────────────
export async function getAdminReports(
  targetType?: AdminReportTargetType,
  status?: AdminReportStatus,
  page = 0,
  size = 20,
): Promise<ReportPageResult> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (targetType) params.set("targetType", targetType);
  if (status) params.set("status", status);

  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/admin/reports?${params}`,
    { credentials: "include" },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(getErrorMessage(body, "신고 목록을 불러오는데 실패했습니다."));
  }

  const json = await response.json();
  return json.data as ReportPageResult;
}

export async function handleAdminReport(
  reportId: number,
  accepted: boolean,
  dismissReason?: string,
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/admin/reports/${reportId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ accepted, dismissReason }),
    },
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(getErrorMessage(body, "신고 처리에 실패했습니다."));
  }
}

// ─── 노쇼 신고 ────────────────────────────────────────────────────
export type NoShowReportItem = {
  reportId: number;
  applicationId: number;
  modelUserId: number;
  modelName: string;
  warningCount: number;
  reportedAt: string;
};

export async function getNoShowReports(): Promise<NoShowReportItem[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/admin/reports/no-show`,
    { credentials: "include" },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(getErrorMessage(body, "노쇼 신고 목록을 불러오는데 실패했습니다."));
  }
  const json = await response.json();
  return json.data as NoShowReportItem[];
}

// ─── 경고 유저 ────────────────────────────────────────────────────
// 백엔드 UserDto: { id, createDate, modifyDate, role, status }
// email/name/warningCount 미포함 — 백엔드 수정 필요
export type WarnedUserItem = {
  id: number;
  role: string;
  status: string;
  createDate: string;
};

export async function getWarnedUsers(minCount = 3): Promise<WarnedUserItem[]> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/admin/users/warnings?minCount=${minCount}`,
    { credentials: "include" },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(getErrorMessage(body, "경고 유저 목록을 불러오는데 실패했습니다."));
  }
  const json = await response.json();
  return json.data as WarnedUserItem[];
}

// ─── 계정 정지 ────────────────────────────────────────────────────
export async function suspendUser(userId: number): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/admin/users/${userId}/suspend`,
    { method: "PATCH", credentials: "include" },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(getErrorMessage(body, "계정 정지에 실패했습니다."));
  }
}
