import { Model, ModelListResponse } from '@/types/model';
import { client } from './client';

interface ModelApiResponse extends Omit<Partial<Model>, 'rating'> {
  avgRating?: number;
}

export async function getModels(params: Record<string, any>): Promise<ModelListResponse> {
  const { data, error } = await client.GET('/api/v1/models', {
    params: {
      query: params as never
    }
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '모델 목록을 불러오는데 실패했습니다.');
  }

  const responseData = (data as { data?: unknown })?.data;
  
  if (Array.isArray(responseData)) {
    const models: Model[] = responseData.map((rawItem) => {
      const item = rawItem as ModelApiResponse;
      return {
      id: item.id ?? 0,
      userId: item.userId ?? 0,
      name: item.name || '이름 없음',
      region: item.region || '지역 미상',
      rating: item.avgRating || 0,
      reviewCount: item.reviewCount || 0,
      profileImageUrl: item.profileImageUrl || '',
      categories: item.categories || [],
      age: item.age,
      height: item.height,
      weight: item.weight,
      sex: item.sex,
      careerStartDate: item.careerStartDate,
      activeRegions: item.activeRegions,
      introduction: item.introduction || '',
      portfolios: item.portfolios || []
      };
    }).filter((item) => item.id > 0 && item.userId > 0);

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
      path: { id: Number(id) }
    }
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '모델 정보를 불러오는데 실패했습니다.');
  }
  
  const item = (data as { data?: ModelApiResponse })?.data;
  if (!item?.id || !item.userId) {
    throw new Error('모델 정보가 올바르지 않습니다.');
  }
  
  return {
    id: item.id,
    userId: item.userId,
    name: item.name || '',
    region: item.region || '',
    rating: item.avgRating || 0,
    reviewCount: item.reviewCount || 0,
    profileImageUrl: item.profileImageUrl || '',
    categories: item.categories || [],
    age: item.age,
    height: item.height,
    weight: item.weight,
    sex: item.sex,
    careerStartDate: item.careerStartDate,
    activeRegions: item.activeRegions,
    tags: item.tags || [],
    introduction: item.introduction || '',
    portfolios: item.portfolios || []
  };
}


export async function getMyModel(customHeaders?: HeadersInit): Promise<Model> {
  const { data, error } = await client.GET('/api/v1/models/my', {
    headers: customHeaders as never
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '내 모델 정보를 불러오는데 실패했습니다.');
  }
  
  const item = (data as { data?: ModelApiResponse })?.data;
  if (!item?.id || !item.userId) {
    throw new Error('모델 정보가 올바르지 않습니다.');
  }
  
  return {
    id: item.id,
    userId: item.userId,
    name: item.name || '',
    region: item.region || '',
    rating: item.avgRating || 0,
    reviewCount: item.reviewCount || 0,
    profileImageUrl: item.profileImageUrl || '',
    categories: item.categories || [],
    age: item.age,
    height: item.height,
    weight: item.weight,
    sex: item.sex,
    careerStartDate: item.careerStartDate,
    activeRegions: item.activeRegions,
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
    sex: modelData.sex,
    age: modelData.age,
    careerStartDate: modelData.careerStartDate,
    activeRegions: modelData.activeRegions,
    categories: modelData.categories || [],
    tags: modelData.tags || [],
    introduction: modelData.introduction,
    region: modelData.region,
    profileImageUrl: modelData.profileImageUrl
  };

  const { error } = await client.PUT('/api/v1/models/my', {
    body: payload as never
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '내 모델 정보를 수정하는데 실패했습니다.');
  }
}
