import { client } from "./client";
import { getErrorMessage } from "./error";
import type { components } from "./schema";

export type PendingClient = components["schemas"]["PendingClientResponse"];

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
