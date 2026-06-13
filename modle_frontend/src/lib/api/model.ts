import { ModelListResponse } from '@/types/model';
import { apiFetch } from './client';

export async function getModels(params: Record<string, string>): Promise<ModelListResponse> {
  const query = new URLSearchParams(params).toString();
  const data = await apiFetch<any>(`/api/v1/models?${query}`);
  
  if (Array.isArray(data)) {
    const models = data.map((item: any) => ({
      id: item.id,
      name: item.name || '이름 없음',
      region: item.region || '지역 미상',
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

export async function getModel(id: string | number): Promise<Model> {
  const data = await apiFetch<any>(`/api/v1/models/${id}`);
  
  // Back-end returns RsData<ModelDto> now. client.ts unpacks RsData and returns data.
  const item = data;
  
  return {
    id: item.id,
    name: item.name || '',
    region: item.region || '',
    rating: item.avg_rating || 0,
    reviewCount: item.review_count || 0,
    profileImageUrl: item.profile_image_url || '',
    categories: item.tags || [],
    age: item.age,
    height: item.height,
    weight: item.weight,
    gender: item.gender,
    field: item.field,
    tags: item.tags || [],
    introduction: item.introduction || ''
  };
}


export async function getMyModel(): Promise<Model> {
  const data = await apiFetch<any>(`/api/v1/models/my`);
  
  const item = data;
  
  return {
    id: item.id,
    name: item.name || '',
    region: item.region || '',
    rating: item.avg_rating || 0,
    reviewCount: item.review_count || 0,
    profileImageUrl: item.profile_image_url || '',
    categories: item.tags || [],
    age: item.age,
    height: item.height,
    weight: item.weight,
    gender: item.gender,
    field: item.field,
    tags: item.tags || [],
    introduction: item.introduction || ''
  };
}

export async function updateMyModel(modelData: Partial<Model>): Promise<void> {
  const payload = {
    name: modelData.name,
    height: modelData.height,
    weight: modelData.weight,
    gender: modelData.gender,
    age: modelData.age,
    field: modelData.field,
    tags: modelData.tags ? modelData.tags.join(',') : '',
    introduction: modelData.introduction,
    profileImageUrl: modelData.profileImageUrl
  };

  await apiFetch<void>(`/api/v1/models/my`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}
