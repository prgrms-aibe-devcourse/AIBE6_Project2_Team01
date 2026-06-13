import { Model, ModelListResponse } from '@/types/model';
import { client } from './client';

export async function getModels(params: Record<string, string>): Promise<ModelListResponse> {
  const { data, error } = await client.GET('/api/v1/models', {
    params: {
      query: params as any
    }
  });
  
  if (error) {
    throw new Error((error as any).msg || '모델 목록을 불러오는데 실패했습니다.');
  }

  const responseData = (data as any).data;
  
  if (Array.isArray(responseData)) {
    const models = responseData.map((item: any) => ({
      id: item.id,
      name: item.name || '이름 없음',
      region: item.region || '지역 미상',
      rating: item.avgRating || 0,
      reviewCount: item.reviewCount || 0,
      profileImageUrl: item.profileImageUrl || '',
      categories: item.categories || [],
      age: item.age,
      height: item.height,
      weight: item.weight,
      introduction: item.introduction || '',
      portfolios: item.portfolios || []
    }));

    return {
      models,
      totalElements: responseData.length,
      hasNext: false
    };
  }
  
  return responseData as ModelListResponse;
}

export async function getModel(id: string | number): Promise<Model> {
  const { data, error } = await client.GET('/api/v1/models/{id}', {
    params: {
      path: { id: String(id) }
    }
  });
  
  if (error) {
    throw new Error((error as any).msg || '모델 정보를 불러오는데 실패했습니다.');
  }
  
  const item = (data as any).data;
  
  return {
    id: item.id,
    name: item.name || '',
    region: item.region || '',
    rating: item.avgRating || 0,
    reviewCount: item.reviewCount || 0,
    profileImageUrl: item.profileImageUrl || '',
    categories: item.categories || [],
    age: item.age,
    height: item.height,
    weight: item.weight,
    gender: item.gender,
    tags: item.tags || [],
    introduction: item.introduction || '',
    portfolios: item.portfolios || []
  };
}


export async function getMyModel(customHeaders?: HeadersInit): Promise<Model> {
  const { data, error } = await client.GET('/api/v1/models/my', {
    headers: customHeaders as any
  });
  
  if (error) {
    throw new Error((error as any).msg || '내 모델 정보를 불러오는데 실패했습니다.');
  }
  
  const item = (data as any).data;
  
  return {
    id: item.id,
    name: item.name || '',
    region: item.region || '',
    rating: item.avgRating || 0,
    reviewCount: item.reviewCount || 0,
    profileImageUrl: item.profileImageUrl || '',
    categories: item.categories || [],
    age: item.age,
    height: item.height,
    weight: item.weight,
    gender: item.gender,
    field: item.field,
    tags: item.tags || [],
    introduction: item.introduction || '',
    portfolios: item.portfolios || []
  };
}

export async function updateMyModel(modelData: Partial<Model>): Promise<void> {
  const payload = {
    name: modelData.name,
    height: modelData.height,
    weight: modelData.weight,
    gender: modelData.gender,
    age: modelData.age,
    categories: modelData.categories || [],
    tags: modelData.tags || [],
    introduction: modelData.introduction,
    profileImageUrl: modelData.profileImageUrl
  };

  const { error } = await client.PUT('/api/v1/models/my', {
    body: payload as any
  });
  
  if (error) {
    throw new Error((error as any).msg || '내 모델 정보를 수정하는데 실패했습니다.');
  }
}

