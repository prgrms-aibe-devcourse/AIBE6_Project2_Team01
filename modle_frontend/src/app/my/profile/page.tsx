import { getMyModel } from '@/lib/api/model';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { MyProfileContainer } from '@/components/profile/MyProfileContainer';

export const metadata = {
  title: '내 프로필 | 모들',
};

export default async function MyProfilePage() {
  let modelData;
  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();
    modelData = await getMyModel({ Cookie: cookieString });
  } catch {
    console.error("내 프로필 로딩 실패:", error);
    // If model is not found or API fails, render 404
    notFound();
  }
  
  return <MyProfileContainer initialData={modelData} />;
}
