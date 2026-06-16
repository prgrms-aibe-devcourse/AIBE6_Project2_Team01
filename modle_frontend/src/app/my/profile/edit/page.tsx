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

export default async function MyProfileEditPage() {
  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();
    const user = await getMe({ Cookie: cookieString });

    if (user.role === 'CLIENT') {
      const clientData = await getMyClient({ Cookie: cookieString });
      return (
        <main className="max-w-[1200px] mx-auto px-6 py-12">
          <ClientEditForm initialData={clientData} />
        </main>
      );
    } else {
      // Default to MODEL
      const modelData = await getMyModel({ Cookie: cookieString });
      return (
        <main className="max-w-[1200px] mx-auto px-6 py-12">
          <ModelEditForm initialData={modelData} />
        </main>
      );
    }
  } catch(error){
    console.error("내 프로필 로딩 실패:", error);
    notFound();
  }
}
