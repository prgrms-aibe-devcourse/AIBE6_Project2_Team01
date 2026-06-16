import { DetailLookbook } from '@/components/model/detail/DetailLookbook';
import { ProfileGallery } from '@/components/model/detail/ProfileGallery';
import { ClientProposalButton } from '@/components/message/ClientProposalButton';
import { getModel } from '@/lib/api/model';
import { notFound } from 'next/navigation';

export const metadata = {
  title: '모델 상세 | 모들',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { id } = await params;

  let modelData;
  try {
    modelData = await getModel(id);
  } catch {
    notFound();
  }

  

  return (
      <main className="w-full bg-white text-black pb-32 font-sans selection:bg-black selection:text-white">
        <div className="max-w-[1000px] mx-auto px-4 md:px-6 pt-6 md:pt-10">
          
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
            
            <div className="w-full md:w-[45%] lg:w-[40%] max-w-[450px] mx-auto md:mx-0">
               <ProfileGallery 
                 portfolios={modelData.portfolios || []} 
                 mainFallback={modelData.profileImageUrl || '/placeholder.png'} 
               />
            </div>

            <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col">
               
               <div className="text-sm font-bold text-gray-500 mb-1 underline underline-offset-4 cursor-pointer hover:text-black transition-colors w-fit">
                  {modelData.categories && modelData.categories.length > 0 
                    ? modelData.categories.join(' / ') 
                    : 'KOREAN MODEL'}
               </div>
               
               <h1 className="text-2xl md:text-3xl font-extrabold text-black mt-3 mb-4 tracking-tight">
                  {modelData.name} <span className="font-normal text-gray-400 text-lg ml-1">({modelData.gender ? '남성' : '여성'})</span>
               </h1>
               
               <div className="flex items-center gap-4 text-sm font-medium border-b border-gray-100 pb-6 mb-6">
                 <div className="flex items-center gap-1">
                   <span className="text-yellow-400 text-lg">★</span>
                   <span className="text-black font-bold">{modelData.rating?.toFixed(1) || '0.0'}</span>
                 </div>
                 <div className="w-px h-3 bg-gray-300"></div>
                 <span className="text-blue-600 underline cursor-pointer hover:text-blue-800">
                   후기 {modelData.reviewCount || 0}개
                 </span>
                 <div className="w-px h-3 bg-gray-300"></div>
                 <span className="text-gray-400">모델 번호: {modelData.id}</span>
               </div>

               <div className="flex flex-col gap-3 text-sm tracking-wide">
                  <div className="flex">
                     <span className="w-24 text-gray-500">활동 지역</span>
                     <span className="text-black font-semibold">{modelData.region || '미상'}</span>
                  </div>
                  <div className="flex">
                     <span className="w-24 text-gray-500">나이</span>
                     <span className="text-black font-semibold">{modelData.age ? `${modelData.age}세` : '미상'}</span>
                  </div>
                  <div className="flex">
                     <span className="w-24 text-gray-500">키 (HEIGHT)</span>
                     <span className="text-black font-semibold">{modelData.height ? `${modelData.height}cm` : '미상'}</span>
                  </div>
                  <div className="flex">
                     <span className="w-24 text-gray-500">몸무게 (WEIGHT)</span>
                     <span className="text-black font-semibold">{modelData.weight ? `${modelData.weight}kg` : '미상'}</span>
                  </div>
                  <div className="flex items-start mt-1">
                     <span className="w-24 text-gray-500 mt-1">관련 태그</span>
                     <div className="flex flex-wrap gap-1.5 flex-1">
                        {modelData.tags?.map((tag, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-600 px-2 py-0.5 text-xs rounded hover:bg-gray-200 cursor-pointer">
                            #{tag.trim()}
                          </span>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="mt-8 md:mt-auto pt-8 flex gap-2">
                  <button className="flex-[1] bg-white border border-gray-300 hover:border-black text-black font-bold py-4 text-center transition-colors">
                    ♡ 관심 모델
                  </button>
                  <ClientProposalButton
                    recipientUserId={modelData.userId}
                    className="flex-[2] bg-black hover:bg-gray-800 text-white font-bold py-4 text-center transition-colors"
                  />
               </div>
            </div>
          </div>

          <div className="mt-20 md:mt-24">
            
            <div className="flex border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex-1 text-center py-4 border-b-[3px] border-black font-bold text-black cursor-pointer">
                상세정보
              </div>
              <div className="flex-1 text-center py-4 font-medium text-gray-400 hover:text-black cursor-pointer transition-colors">
                리뷰 ({modelData.reviewCount || 0})
              </div>
              <div className="flex-1 text-center py-4 font-medium text-gray-400 hover:text-black cursor-pointer transition-colors">
                Q&A (0)
              </div>
            </div>

            <div className="max-w-[800px] mx-auto mt-12 flex flex-col items-center gap-4 md:gap-8 pb-20">
              
              <div className="text-center text-gray-800 leading-loose whitespace-pre-wrap mb-10 text-sm md:text-base px-4 font-medium">
                 {modelData.introduction || '작성된 모델 소개글이 없습니다.'}
              </div>

              <DetailLookbook portfolios={modelData.portfolios || []} />
            </div>
            
          </div>

        </div>
      </main>
    );
}
