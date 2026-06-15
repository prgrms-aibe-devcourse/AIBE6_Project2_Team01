import { ModelEditForm } from '@/components/model/ModelEditForm';
import { getMyModel } from '@/lib/api/model';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const metadata = {
  title: '내 프로필 수정 | 모들',
};

export default async function MyProfileEditPage() {
  let modelData;
  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();
    modelData = await getMyModel({ Cookie: cookieString });
  } catch(error){
    console.error("내 프로필 로딩 실패:", error);
    // If model is not found or API fails, render 404 or redirect to login
    notFound();
  }
  
  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      <ModelEditForm initialData={modelData} />
    </main>
  );
}
