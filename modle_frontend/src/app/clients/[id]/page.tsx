import { getClientProfile } from '@/lib/api/clientProfile';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export const metadata = {
  title: '클라이언트 상세 | 모들',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const clientData = await getClientProfile(id);

    return (
      <main className="w-full bg-white text-black pb-32 font-sans selection:bg-black selection:text-white">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 pt-6 md:pt-10">
          
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            
            {/* 좌측 프로필 이미지 (명함 형태) */}
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
                 <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                   후기 {clientData.reviewCount || 0}개
                 </span>
                 <div className="w-px h-3 bg-gray-300"></div>
                 <span className="text-gray-400">클라이언트 번호: {clientData.id}</span>
               </div>

               <div className="flex flex-col gap-3 text-sm tracking-wide">
                  <div className="flex">
                     <span className="w-32 text-gray-500">사업자 등록번호</span>
                     <span className="text-black font-semibold">{clientData.companyNumber || '미상'}</span>
                  </div>
                  <div className="flex">
                     <span className="w-32 text-gray-500">가입일</span>
                     <span className="text-black font-semibold">
                       {clientData.createdDate ? new Date(clientData.createdDate).toLocaleDateString() : '미상'}
                     </span>
                  </div>
               </div>

               <div className="mt-8 md:mt-auto pt-8 flex gap-2">
                  <button className="flex-[1] bg-white border border-gray-300 hover:border-black text-black font-bold py-4 text-center transition-colors">
                    ♡ 관심 등록
                  </button>
                  <button className="flex-[2] bg-black hover:bg-gray-800 text-white font-bold py-4 text-center transition-colors">
                    메시지 보내기
                  </button>
               </div>
            </div>
          </div>

          <div className="mt-20 md:mt-24">
            
            {/* 탭 메뉴 */}
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex-1 text-center py-4 border-b-[3px] border-black font-bold text-black cursor-pointer">
                기업 소개
              </div>
              <div className="flex-1 text-center py-4 font-medium text-gray-400 hover:text-black cursor-pointer transition-colors">
                리뷰 ({clientData.reviewCount || 0})
              </div>
              <div className="flex-1 text-center py-4 font-medium text-gray-400 hover:text-black cursor-pointer transition-colors">
                진행 중인 공고
              </div>
            </div>

            {/* 기업 소개 내용 */}
            <div className="max-w-[800px] mx-auto mt-12 flex flex-col gap-4 md:gap-8 pb-20">
              <div className="text-gray-800 leading-loose whitespace-pre-wrap text-sm md:text-base px-4 font-medium bg-gray-50 p-8 border border-gray-100">
                 {clientData.introduction || '작성된 기업 소개글이 없습니다.'}
              </div>
            </div>
            
          </div>

        </div>
      </main>
    );
  } catch (error) {
    notFound();
  }
}
