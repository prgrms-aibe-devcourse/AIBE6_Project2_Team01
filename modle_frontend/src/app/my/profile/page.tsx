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

async function getProfilePageData() {
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

export default async function MyProfilePage() {
  let pageData: Awaited<ReturnType<typeof getProfilePageData>>;

  try {
    pageData = await getProfilePageData();
  } catch(error) {
    console.error("내 프로필 로딩 실패:", error);
    notFound();
  }

  if (pageData.role === 'CLIENT') {
    return <MyClientProfileContainer initialData={pageData.data} />;
  }

  return <MyProfileContainer initialData={pageData.data} />;
}
