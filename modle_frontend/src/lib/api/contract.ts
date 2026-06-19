import { API_BASE_URL, authenticatedFetch } from "@/lib/api/client";

interface ApiResponse<T> {
  data: T;
}

export type ContractStatus =
  | "DRAFT"
  | "NOTIFIED"
  | "VIEWED"
  | "AGREED"
  | "REJECTED"
  | "CONFIRMED"
  | "CANCELLED";

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: "초안",
  NOTIFIED: "발송 완료",
  VIEWED: "열람 완료",
  AGREED: "동의 완료",
  REJECTED: "거절",
  CONFIRMED: "계약 확정",
  CANCELLED: "취소",
};

export function formatContractStatus(status: ContractStatus): string {
  return CONTRACT_STATUS_LABELS[status] ?? status;
}

export type ContractResponse = {
  id: number;
  applicationId: number;
  contractType: "TEMPLATE" | "FILE";
  shootStartAt: string;
  shootEndAt: string;
  location: string;
  payment: number;
  payType: "CASH" | "SERVICE" | "FREE";
  usageScope: string;
  memo: string | null;
  pdfUrl: string | null;
  signedPdfUrl: string | null;
  rejectReason: string | null;
  status: ContractStatus;
};

export type ContractPdfResponse = {
  contractId: number;
  pdfUrl: string;
  status: ContractStatus;
};

export type ContractDraftResponse = {
  contractId: number;
  applicationId: number;
  contractType: "TEMPLATE" | "FILE";
  shootStartAt: string;
  shootEndAt: string;
  location: string;
  payment: number;
  payType: "CASH" | "SERVICE" | "FREE";
  usageScope: string;
  memo: string | null;
  pdfUrl: string | null;
  status: ContractStatus;
};

export type ContractViewResponse = {
  id: number;
  applicationId: number;
  contractType: "TEMPLATE" | "FILE";
  shootStartAt: string;
  shootEndAt: string;
  location: string;
  payment: number;
  payType: "CASH" | "SERVICE" | "FREE";
  usageScope: string;
  memo: string | null;
  status: ContractStatus;
  pdfUrl: string | null;
  signedPdfUrl: string | null;
  rejectReason: string | null;
  viewedAt: string | null;
};

export type ContractStatusResponse = {
  contractId: number;
  applicationId: number;
  contractSent: boolean;
  status: ContractStatus;
  clientAgreed: boolean;
  modelAgreed: boolean;
  pdfUrl: string | null;
  rejectReason: string | null;
  shootingAvailable: boolean;
};

export async function createContractPdf(
  contractId: number,
): Promise<ContractPdfResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/contracts/pdf`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contractId }),
    },
  );

  if (!response.ok) {
    throw new Error("계약서 PDF를 생성하지 못했습니다.");
  }

  return ((await response.json()) as ApiResponse<ContractPdfResponse>).data;
}

export async function notifyContract(
  contractId: number,
): Promise<ContractResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/contracts/${contractId}/notify`,
    {
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("계약서를 발송하지 못했습니다.");
  }

  return ((await response.json()) as ApiResponse<ContractResponse>).data;
}

export async function viewContract(
  contractId: number,
): Promise<ContractViewResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/contracts/${contractId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("계약 정보를 조회하지 못했습니다.");
  }

  return ((await response.json()) as ApiResponse<ContractViewResponse>).data;
}

export async function agreeContract(
  contractId: number,
): Promise<ContractResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/contracts/${contractId}/agree`,
    {
      method: "PATCH",
    },
  );

  if (!response.ok) {
    throw new Error("계약 동의에 실패했습니다.");
  }

  return ((await response.json()) as ApiResponse<ContractResponse>).data;
}

export async function rejectContract(
  contractId: number,
  rejectReason: string,
): Promise<ContractResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/contracts/${contractId}/reject`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rejectReason }),
    },
  );

  if (!response.ok) {
    throw new Error("계약 거절에 실패했습니다.");
  }

  return ((await response.json()) as ApiResponse<ContractResponse>).data;
}

export async function getContractStatus(
  applicationId: number,
): Promise<ContractStatusResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/applications/${applicationId}/contract-status`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("계약 상태를 조회하지 못했습니다.");
  }

  return ((await response.json()) as ApiResponse<ContractStatusResponse>).data;
}

export async function getContractDraft(
  applicationId: number,
): Promise<ContractDraftResponse> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/v1/applications/${applicationId}/contract-draft`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("계약 임시저장 정보를 조회하지 못했습니다.");
  }

  return ((await response.json()) as ApiResponse<ContractDraftResponse>).data;
}
