'use client'

import { getModel } from '@/lib/api/model';
import Image from 'next/image';
import { notFound } from 'next/navigation';


interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { id } = await params;

  try {
    const modelData = await getModel(id);
    
    return (
      <main className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="bg-white border-t-2 border-black pt-10 text-black">
          {/* 상단 프로필 기본 정보 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
            <div className="relative w-48 h-48 md:w-64 md:h-64 shrink-0">
              <Image
                src={modelData.profileImageUrl || '/images/default-avatar.png'}
                alt={`${modelData.name} 프로필 이미지`}
                fill
                className="object-cover border border-gray-200 bg-gray-50"
                sizes="(max-width: 768px) 192px, 256px"
                onError={(e) => {
                  e.currentTarget.srcset = '/images/default-avatar.png';
                }}
              />
            </div>
            
            <div className="flex flex-col items-center md:items-start flex-grow w-full">
              <div className="flex justify-between items-start w-full">
                <div>
                  <h1 className="text-4xl md:text-5xl text-black font-black mb-2 tracking-tighter uppercase">{modelData.name}</h1>
                  <p className="text-gray-500 mb-6 font-medium text-lg">{modelData.region || '지역 미상'}</p>
                </div>
                {/* 평점 및 리뷰 수 표시 */}
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-yellow-400 text-2xl">★</span>
                    <span className="text-2xl font-bold">{modelData.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-gray-500 underline cursor-pointer">리뷰 {modelData.reviewCount}개</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
                <span className="px-4 py-2 border border-black bg-white text-black text-sm font-bold uppercase tracking-widest">
                  {modelData.gender ? '남성' : '여성'}
                </span>
                <span className="px-4 py-2 border border-black bg-white text-black text-sm font-bold uppercase tracking-widest">
                  {modelData.age ? `${modelData.age}세` : '나이 미상'}
                </span>
                <span className="px-4 py-2 border border-black bg-white text-black text-sm font-bold uppercase tracking-widest">
                  {modelData.height ? `${modelData.height}cm` : '키 미상'}
                </span>
                <span className="px-4 py-2 border border-black bg-white text-black text-sm font-bold uppercase tracking-widest">
                  {modelData.weight ? `${modelData.weight}kg` : '몸무게 미상'}
                </span>
              </div>
              
              {modelData.categories && modelData.categories.length > 0 && (
                <div className="mt-4 w-full">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2 border-b border-gray-200 pb-1">활동 카테고리</h3>
                  <div className="flex flex-wrap gap-2">
                    {modelData.categories.map((category, idx) => (
                      <span key={idx} className="text-black font-semibold bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <hr className="border-hairline mb-8 border-gray-300" />

          {/* 소개글 영역 */}
          <div className="mb-12">
            <h3 className="text-2xl text-black font-black mb-6 uppercase tracking-widest border-b-2 border-black pb-3">소개글 (ABOUT ME)</h3>
            <div className="bg-gray-50 border border-gray-200 p-8 text-black text-base font-medium leading-relaxed whitespace-pre-wrap rounded-lg">
              {modelData.introduction || '아직 작성된 소개글이 없습니다.'}
            </div>
          </div>

          {/* 태그 영역 */}
          <div className="mb-12">
            <h3 className="text-2xl text-black font-black mb-6 uppercase tracking-widest border-b-2 border-black pb-3">태그 (TAGS)</h3>
            {modelData.tags && modelData.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {modelData.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="px-4 py-2 bg-black text-white text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm font-medium text-gray-500">등록된 태그가 없습니다.</p>
            )}
          </div>

          {/* 액션 버튼 영역 */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
            <button className="flex-1 py-4 bg-white border-2 border-black text-black font-bold text-lg uppercase tracking-widest hover:bg-gray-50 transition-colors">
              관심 등록 (Like)
            </button>
            <button className="flex-1 py-4 bg-black text-white font-bold text-lg uppercase tracking-widest hover:bg-gray-800 transition-colors">
              섭외 문의 (Contact)
            </button>
          </div>

        </div>
      </main>
    );
  } catch (error) {
    // If model is not found or API fails, render 404
    notFound();
  }
}