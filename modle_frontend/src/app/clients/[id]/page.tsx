import { ClientDetailTabsSection } from "@/components/profile/ClientDetailTabsSection";
import { getClientProfile } from '@/lib/api/clientProfile';
import { getRegionLabel } from '@/lib/constants/region';
import Image from 'next/image';
import { notFound } from 'next/navigation';

export const metadata = {
  title: '클라이언트 상세 | 모들',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;

  let clientData;
  try {
    clientData = await getClientProfile(id);
  } catch {
    notFound();
  }

  return (
    <main className="w-full bg-white text-black pb-32 font-sans selection:bg-black selection:text-white">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6 pt-6 md:pt-10">

        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

          {/* 좌측 프로필 이미지 */}
          <div className="w-full md:w-[45%] lg:w-[40%] max-w-[450px] mx-auto md:mx-0">
            <div className="relative w-full aspect-[3/4] bg-gray-50 border border-gray-100 overflow-hidden group">
              <Image
                src={clientData.profileImageUrl || '/images/default-avatar.png'}
                alt={`${clientData.companyName} 프로필`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </div>

          {/* 우측 클라이언트 정보 */}
          <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col">
            <div className="text-sm font-bold text-gray-500 mb-1 underline underline-offset-4 cursor-pointer hover:text-black transition-colors w-fit">
              {clientData.clientType === 'CORPORATE' ? '기업 클라이언트' : '개인 클라이언트'}
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold text-black mt-3 mb-4 tracking-tight">
              {clientData.companyName}
            </h1>

            <div className="flex items-center gap-4 text-sm font-medium border-b border-gray-100 pb-6 mb-6">
              <div className="flex items-center gap-1">
                <span className="text-yellow-400 text-lg">★</span>
                <span className="text-black font-bold">{clientData.avgRating?.toFixed(1) || '0.0'}</span>
              </div>
              <div className="w-px h-3 bg-gray-300"></div>
              <span className="text-gray-600">후기 {clientData.reviewCount || 0}개</span>
            </div>

            <div className="flex flex-col gap-3 text-sm tracking-wide">
              <div className="flex">
                <span className="w-32 text-gray-500">지역</span>
                <span className="text-black font-semibold">{getRegionLabel(clientData.region)}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500">가입일</span>
                <span className="text-black font-semibold">
                  {clientData.createdDate ? new Date(clientData.createdDate).toLocaleDateString() : '미상'}
                </span>
              </div>
            </div>

            <div className="mt-8 md:mt-auto pt-8 flex gap-2">
              <button className="w-full bg-white border border-gray-300 hover:border-black text-black font-bold py-4 text-center transition-colors">
                ♡ 관심 등록
              </button>
            </div>
          </div>
        </div>

        {clientData.userId ? (
          <ClientDetailTabsSection
            clientUserId={clientData.userId}
            reviewCount={clientData.reviewCount || 0}
            introduction={clientData.introduction || ''}
          />
        ) : (
          /* userId 없는 경우 기존 정적 렌더링 */
          <div className="mt-20 md:mt-24">
            <div className="mx-auto max-w-[800px] pb-20 pt-10">
              <div className="border border-gray-100 bg-gray-50 p-8 text-sm font-medium leading-loose text-gray-800 whitespace-pre-wrap md:text-base">
                {clientData.introduction || '작성된 기업 소개글이 없습니다.'}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
