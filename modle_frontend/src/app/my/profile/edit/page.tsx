import { ModelEditForm } from '@/components/model/ModelEditForm';
import { ClientEditForm } from '@/components/profile/ClientEditForm';
import { getMyModel } from '@/lib/api/model';
import { getMyClient } from '@/lib/api/clientProfile';
import { getMe } from '@/lib/api/auth';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const metadata = {
  title: '내 프로필 수정 | 모들',
};

async function getProfileEditPageData() {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();
  const user = await getMe({ Cookie: cookieString });

  if (user.role === 'CLIENT') {
    return {
      role: 'CLIENT' as const,
      data: await getMyClient({ Cookie: cookieString }),
    };
  }

  return {
    role: 'MODEL' as const,
    data: await getMyModel({ Cookie: cookieString }),
  };
}

export default async function MyProfileEditPage() {
  let pageData: Awaited<ReturnType<typeof getProfileEditPageData>>;

  try {
    pageData = await getProfileEditPageData();
  } catch(error){
    console.error("내 프로필 로딩 실패:", error);
    notFound();
  }

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      {pageData.role === 'CLIENT' ? (
        <ClientEditForm initialData={pageData.data} />
      ) : (
        <ModelEditForm initialData={pageData.data} />
      )}
    </main>
  );
}
