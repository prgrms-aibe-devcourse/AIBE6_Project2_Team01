import { MyProfileContainer } from '@/components/profile/MyProfileContainer';
import { MyClientProfileContainer } from '@/components/profile/MyClientProfileContainer';
import { getMyModel } from '@/lib/api/model';
import { getMyClient } from '@/lib/api/clientProfile';
import { getMe } from '@/lib/api/auth';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

export const metadata = {
  title: '내 프로필 | 모들',
};

export default async function MyProfilePage() {
  try {
    const cookieStore = await cookies();
    const cookieString = cookieStore.toString();
    const user = await getMe({ Cookie: cookieString });

    if (user.role === 'CLIENT') {
      const clientData = await getMyClient({ Cookie: cookieString });
      return <MyClientProfileContainer initialData={clientData} />;
    } else {
      // Default to MODEL
      const modelData = await getMyModel({ Cookie: cookieString });
      return <MyProfileContainer initialData={modelData} />;
    }
  } catch(error) {
    console.error("내 프로필 로딩 실패:", error);
    notFound();
  }
}
