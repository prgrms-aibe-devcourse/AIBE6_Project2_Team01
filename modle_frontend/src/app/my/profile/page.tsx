import { getMyModel } from '@/lib/api/model';
import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { MyProfileContainer } from '@/components/profile/MyProfileContainer';

export const metadata = {
  title: '내 프로필 | 모들',
};

export default async function MyProfilePage() {
  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();
    const modelData = await getMyModel({ Cookie: cookieString });
    
    return <MyProfileContainer initialData={modelData} />;
  } catch (error) {
    console.error("내 프로필 로딩 실패:", error);
    // If model is not found or API fails, render 404
    notFound();
  }
}
