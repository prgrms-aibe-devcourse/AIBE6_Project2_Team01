import { Client } from '@/types/client';
import { client } from './client';

export async function getClientProfile(id: string | number): Promise<Client> {
  const { data, error } = await client.GET('/api/v1/clients/{id}', {
    params: {
      path: { id: Number(id) }
    }
  });
  
  if (error) {
    throw new Error((error as any).msg || '클라이언트 정보를 불러오는데 실패했습니다.');
  }
  
  const item = (data as any).data;
  
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
