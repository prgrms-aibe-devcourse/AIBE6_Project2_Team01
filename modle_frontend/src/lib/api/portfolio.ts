import { apiFetch } from './client';
import { Portfolio } from '@/types/model';

// 1. 여러 장 업로드 함수
export const uploadPortfolioImages = async (files: File[]): Promise<Portfolio[]> => {
  const formData = new FormData();
  
  // 선택된 여러 개의 파일을 'files'라는 이름으로 모두 담기
  files.forEach((file) => {
    formData.append('files', file); 
  });
  const response = await apiFetch<Portfolio[]>('/api/v1/portfolios', {
    method: 'POST',
    body: formData,
  });
  
  return response; 
};

// 2. 개별 사진 삭제 함수
export const deletePortfolioImage = async (portfolioId: number) => {
  const response = await apiFetch(`/api/v1/portfolios/${portfolioId}`, {
    method: 'DELETE',
  });
  
  return response;
};
