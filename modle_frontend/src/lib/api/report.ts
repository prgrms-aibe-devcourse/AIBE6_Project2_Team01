import { API_BASE_URL } from "./client";
import { getErrorMessage } from "./error";

export type ReportTargetType = "JOB_POSTING" | "PROFILE" | "MESSAGE";
export type ReportReason = "SPAM" | "INAPPROPRIATE" | "FRAUD" | "HARASSMENT" | "OTHER";

export const REASON_LABELS: Record<ReportReason, string> = {
  SPAM: "스팸",
  INAPPROPRIATE: "부적절한 콘텐츠",
  FRAUD: "사기",
  HARASSMENT: "괴롭힘",
  OTHER: "기타",
};

export interface CreateReportPayload {
  targetType: ReportTargetType;
  targetId: number;
  reason: ReportReason;
  description?: string;
}

export async function createReport(payload: CreateReportPayload): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/v1/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(getErrorMessage(body, "신고 접수에 실패했습니다."));
  }
}
