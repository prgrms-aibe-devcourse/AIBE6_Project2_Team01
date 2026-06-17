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
  status: ContractStatus;
};

export type ContractPdfResponse = {
  contractId: number;
  pdfUrl: string;
  status: ContractStatus;
};

export async function createContractPdf(
  contractId: number,
): Promise<ContractPdfResponse> {
  const response = await authenticatedFetch(`${API_BASE_URL}/api/v1/contracts/pdf`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contractId }),
  });

  if (!response.ok) {
    throw new Error("계약서 PDF를 생성하지 못했습니다.");
  }

  return ((await response.json()) as ApiResponse<ContractPdfResponse>).data;
}

export async function notifyContract(contractId: number): Promise<ContractResponse> {
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
