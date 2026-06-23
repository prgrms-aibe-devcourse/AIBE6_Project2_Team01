import { Model, ModelListResponse } from '@/types/model';
import { client } from './client';

interface ModelApiResponse extends Omit<Partial<Model>, 'rating'> {
  avgRating?: number;
}

export async function getModels(params: Record<string, string | string[] | undefined>): Promise<ModelListResponse> {
  const safeQuery: Record<string, string | string[] | undefined> = { ...params };
  for (const key in safeQuery) {
    if (Array.isArray(safeQuery[key])) {
      safeQuery[key] = safeQuery[key].join(',');
    }
  }

  const { data, error } = await client.GET('/api/v1/models', {
    params: {
      query: safeQuery as never
    },
    cache: 'no-store'
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '모델 목록을 불러오는데 실패했습니다.');
  }

  const responseData = (data as { data?: unknown })?.data;
  
  const mapItem = (rawItem: unknown): Model => {
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
      activeRegions: item.activeRegions,
      introduction: item.introduction || '',
      portfolios: item.portfolios || [],
      experience: item.experience,
      topSize: item.topSize,
      bottomSize: item.bottomSize,
      shoeSize: item.shoeSize,
      availableDays: item.availableDays
    };
  };

  if (responseData && typeof responseData === 'object' && !Array.isArray(responseData) && 'content' in responseData) {
    const pageData = responseData as { content: unknown[], last: boolean, totalElements: number, totalPages: number };
    const models = pageData.content.map(mapItem).filter((item) => item.id > 0 && item.userId > 0);
    return {
      models,
      totalElements: pageData.totalElements || 0,
      totalPages: pageData.totalPages || Math.ceil((pageData.totalElements || 0) / 12) || 1,
      hasNext: !pageData.last
    };
  } else if (Array.isArray(responseData)) {
    const models = responseData.map(mapItem).filter((item) => item.id > 0 && item.userId > 0);
    return {
      models,
      totalElements: responseData.length,
      totalPages: Math.ceil(responseData.length / 12) || 1,
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
    activeRegions: item.activeRegions,
    tags: item.tags || [],
    introduction: item.introduction || '',
    portfolios: item.portfolios || [],
    experience: item.experience,
    topSize: item.topSize,
    bottomSize: item.bottomSize,
    shoeSize: item.shoeSize,
    availableDays: item.availableDays
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
    activeRegions: item.activeRegions,
    field: item.field,
    tags: item.tags || [],
    introduction: item.introduction || '',
    portfolios: item.portfolios || [],
    experience: item.experience,
    topSize: item.topSize,
    bottomSize: item.bottomSize,
    shoeSize: item.shoeSize,
    availableDays: item.availableDays
  };
}

export async function updateMyModel(modelData: Partial<Model>): Promise<void> {
  const payload = {
    name: modelData.name,
    height: modelData.height,
    weight: modelData.weight,
    sex: modelData.sex,
    age: modelData.age,
    activeRegions: modelData.activeRegions,
    categories: modelData.categories || [],
    tags: modelData.tags || [],
    introduction: modelData.introduction,
    region: modelData.region,
    profileImageUrl: modelData.profileImageUrl,
    experience: modelData.experience,
    topSize: modelData.topSize,
    bottomSize: modelData.bottomSize,
    shoeSize: modelData.shoeSize,
    availableDays: modelData.availableDays
  };

  const { error } = await client.PUT('/api/v1/models/my', {
    body: payload as never
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '내 모델 정보를 수정하는데 실패했습니다.');
  }
}
