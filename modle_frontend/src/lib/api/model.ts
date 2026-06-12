import { apiFetch } from './client';
import { ModelListResponse } from '@/types/model';

export async function getModels(params: Record<string, string>): Promise<ModelListResponse> {
  const query = new URLSearchParams(params).toString();
  return apiFetch<ModelListResponse>(`/api/models?${query}`);
}
