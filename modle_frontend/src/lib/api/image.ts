import { client } from './client';

//단일 이미지 업로드
// 파일을 폼데이터로 감싸서 백엔드에 보내고, GCS URL을 응답받습니다.
export async function uploadImage(file: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    // client.POST가 알아서 멀티파트 폼 데이터로 보내줌
    const { data, error } = await client.POST('/api/v1/images/upload', {
      body: formData as any,
    });
    
    // imageUrl만 반환된다고 가정 (Response 구조에 따라 다를 수 있음)
    // 에러 발생시 예외 처리
    if (error) {
      throw new Error(JSON.stringify(error));
    }
    // 백엔드에서 반환한 응답이 그대로 data에 들어옵니다. (ex. { "imageUrl": "..." })
    return (data as any).imageUrl;
  } catch (error) {
    console.error("이미지 업로드 오류:", error);
    throw error;
  }
}