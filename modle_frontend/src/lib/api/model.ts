import { apiFetch } from './client';
import { ModelListResponse } from '@/types/model';

export async function getModels(params: Record<string, string>): Promise<ModelListResponse> {
  const query = new URLSearchParams(params).toString();
  const data = await apiFetch<any>(`/api/v1/models?${query}`);
  
  if (Array.isArray(data)) {
    const models = data.map((item: any) => ({
      id: item.id,
      name: item.name || '이름 없음',
      region: '지역 미상', // default
      rating: item.avg_rating || 0,
      reviewCount: item.review_count || 0,
      profileImageUrl: item.profile_image_url || '',
      categories: [], // default empty array
      age: item.age,
      height: item.height,
      weight: item.weight,
      introduction: item.introduction || ''
    }));

    return {
      models,
      totalElements: data.length,
      hasNext: false
    };
  }
  
  return data as ModelListResponse;
}
