import { Client } from '@/types/client';
import { client } from './client';
import { components } from './schema';

export type ClientJobPosting = components["schemas"]["MyJobPostingResponse"];

/**
 * 특정 의뢰인(클라이언트 프로필 id)의 공개 공고 목록을 조회한다.
 * 공개 상태(모집중/촬영중/완료/마감)만 노출되며, status로 단일 상태 필터링이 가능하다.
 * 비로그인 포함 누구나 조회 가능한 엔드포인트라 인증 없이 호출한다.
 */
export async function getClientJobPostings(
  id: string | number,
  status?: string,
): Promise<ClientJobPosting[]> {
  const { data, error } = await client.GET('/api/v1/clients/{id}/job-postings', {
    params: {
      path: { id: Number(id) },
      query: status ? { status } : {},
    },
  });

  if (error) {
    throw new Error((error as { msg?: string })?.msg || '공고 목록을 불러오는데 실패했습니다.');
  }

  return data?.data ?? [];
}

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
    userId: (item as Client & { userId?: number }).userId,
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

export async function getMyClient(customHeaders?: HeadersInit): Promise<Client> {
  const { data, error } = await client.GET('/api/v1/clients/my', {
    headers: customHeaders as never
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '내 클라이언트 정보를 불러오는데 실패했습니다.');
  }
  
  const item = (data as { data?: Partial<Client> })?.data;
  if (!item?.id) {
    throw new Error('클라이언트 정보가 올바르지 않습니다.');
  }
  
  return {
    id: item.id,
    userId: (item as Client & { userId?: number }).userId,
    createdDate: item.createdDate,
    modifiedDate: item.modifiedDate,
    clientType: item.clientType || 'UNKNOWN',
    companyName: item.companyName || '',
    companyNumber: item.companyNumber || '',
    introduction: item.introduction || '',
    profileImageUrl: item.profileImageUrl || '',
    avgRating: item.avgRating || 0,
    reviewCount: item.reviewCount || 0,
    region: item.region || ''
  };
}

export async function updateMyClient(clientData: Partial<Client>): Promise<void> {
  const { error } = await client.PUT('/api/v1/clients/my', {
    body: {
      companyName: clientData.companyName || '',
      companyNumber: clientData.companyNumber || '',
      clientType: clientData.clientType as "INDIVIDUAL" | "ORGANIZATION",
      region: clientData.region || '',
      introduction: clientData.introduction || '',
      profileImageUrl: clientData.profileImageUrl || ''
    } as components["schemas"]["ClientModifyReqBody"]
  });

  if (error) {
    throw new Error((error as { msg?: string })?.msg || '클라이언트 정보 수정에 실패했습니다.');
  }
}
