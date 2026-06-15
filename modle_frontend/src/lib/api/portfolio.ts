import { Portfolio } from '@/types/model';
import { client } from './client';

// 1. 여러 장 업로드 함수
export const uploadPortfolioImages = async (files: File[]): Promise<Portfolio[]> => {
  const formData = new FormData();
  
  // 선택된 여러 개의 파일을 'files'라는 이름으로 모두 담기
  files.forEach((file) => {
    formData.append('files', file); 
  });
  const { data, error } = await client.POST('/api/v1/portfolios', {
    body: formData as never,
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '포트폴리오 업로드에 실패했습니다.');
  }
  
  return (data as { data?: unknown })?.data as Portfolio[]; 
};

export const deletePortfolioImage = async (portfolioId: number) => {
  const { data, error } = await client.DELETE('/api/v1/portfolios/{id}', {
    params: {
      path: { id: Number(portfolioId) }
    }
  });
  
  if (error) {
    throw new Error((error as { msg?: string })?.msg || '포트폴리오 삭제에 실패했습니다.');
  }
  
  return (data as { data?: unknown })?.data;
};
