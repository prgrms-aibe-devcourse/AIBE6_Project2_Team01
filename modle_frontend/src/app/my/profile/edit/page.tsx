import { getMyModel } from '@/lib/api/model';
import { ModelEditForm } from '@/components/model/ModelEditForm';
import { notFound } from 'next/navigation';

export const metadata = {
  title: '내 프로필 수정 | 모들',
};

export default async function MyProfileEditPage() {
  try {
    const modelData = await getMyModel();
    
    return (
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <header className="mb-8 text-center">
          <h1 className="text-display-lg text-ink">내 프로필 수정</h1>
          <p className="text-body-lg text-body mt-2">프로필 정보를 최신 상태로 유지하세요.</p>
        </header>

        <ModelEditForm initialData={modelData} />
      </main>
    );
  } catch (error) {
    console.error("내 프로필 로딩 실패:", error);
    // If model is not found or API fails, render 404 or redirect to login
    notFound();
  }
}
