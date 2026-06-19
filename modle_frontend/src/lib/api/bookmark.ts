import { API_BASE_URL, authenticatedFetch } from "./client";
import { getErrorMessage } from "./error";

export interface JobBookmark {
  jobPostingId: number;
  title: string;
  category: string;
  region: string;
  createdDate: string;
}

export interface ModelBookmark {
  modelId: number;
  name: string;
  profileImageUrl?: string;
  createdDate: string;
}

async function bFetch(path: string, method = "GET"): Promise<Response> {
  return authenticatedFetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
  });
}

async function throwIfNotOk(res: Response, defaultMsg: string): Promise<void> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(getErrorMessage(body, defaultMsg));
  }
}

// ─── 공고 북마크 (MODEL 전용) ─────────────────────────────────────
export async function getJobBookmarks(): Promise<JobBookmark[]> {
  const res = await bFetch("/api/v1/bookmarks/jobs");
  await throwIfNotOk(res, "공고 북마크 목록을 불러오지 못했습니다.");
  const json = await res.json();
  return (json.data ?? []) as JobBookmark[];
}

export async function addJobBookmark(jobPostingId: number): Promise<void> {
  const res = await bFetch(`/api/v1/bookmarks/jobs/${jobPostingId}`, "POST");
  await throwIfNotOk(res, "공고 북마크 추가에 실패했습니다.");
}

export async function removeJobBookmark(jobPostingId: number): Promise<void> {
  const res = await bFetch(`/api/v1/bookmarks/jobs/${jobPostingId}`, "DELETE");
  await throwIfNotOk(res, "공고 북마크 삭제에 실패했습니다.");
}

// ─── 모델 북마크 (CLIENT 전용) ────────────────────────────────────
export async function getModelBookmarks(): Promise<ModelBookmark[]> {
  const res = await bFetch("/api/v1/bookmarks/models");
  await throwIfNotOk(res, "모델 북마크 목록을 불러오지 못했습니다.");
  const json = await res.json();
  return (json.data ?? []) as ModelBookmark[];
}

export async function addModelBookmark(modelId: number): Promise<void> {
  const res = await bFetch(`/api/v1/bookmarks/models/${modelId}`, "POST");
  await throwIfNotOk(res, "모델 북마크 추가에 실패했습니다.");
}

export async function removeModelBookmark(modelId: number): Promise<void> {
  const res = await bFetch(`/api/v1/bookmarks/models/${modelId}`, "DELETE");
  await throwIfNotOk(res, "모델 북마크 삭제에 실패했습니다.");
}
