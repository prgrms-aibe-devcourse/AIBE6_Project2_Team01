import { apiFetch } from './client';

//단일 이미지 업로드
// 파일을 폼데이터로 감싸서 백엔드에 보내고, GCS URL을 응답받습니다.
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  // apiFetch가 알아서 멀티파트 폼 데이터로 보내줌
  const response = await apiFetch<{ imageUrl: string }>('/api/v1/images/upload', {
    method: 'POST',
    body: formData,
  });
  return response.imageUrl;
}