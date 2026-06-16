import { Client } from '@/types/client';
import { client } from './client';

export async function getClientProfile(id: string | number): Promise<Client> {
  const { data, error } = await client.GET('/api/v1/clients/{id}', {
    params: {
      path: { id: Number(id) }
    }
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '클라이언트 정보를 불러오는데 실패했습니다.');
  }
  
  const item = (data as { data?: Partial<Client> })?.data;
  if (!item?.id) {
    throw new Error('클라이언트 정보가 올바르지 않습니다.');
  }
  
  return {
    id: item.id,
    createdDate: item.createdDate,
    modifiedDate: item.modifiedDate,
    clientType: item.clientType || 'UNKNOWN',
    companyName: item.companyName || '',
    companyNumber: item.companyNumber || '',
    introduction: item.introduction || '',
    profileImageUrl: item.profileImageUrl || '',
    avgRating: item.avgRating || 0,
    reviewCount: item.reviewCount || 0,
  };
}
