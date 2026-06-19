'use client';

import { useState } from 'react';

interface Portfolio {
  id: number;
  imgUrl: string;
}

interface DetailLookbookProps {
  portfolios: Portfolio[];
}

export function DetailLookbook({ portfolios }: DetailLookbookProps) {
  const INITIAL_COUNT = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        등록된 포트폴리오 이미지가 없습니다.
      </div>
    );
  }

  // 프론트엔드 강제 정렬 제거: 백엔드에서 내려주는 displayOrder 기준 배열 순서를 그대로 따름
  const displayedPortfolios = portfolios.slice(0, visibleCount);
  const hasMore = visibleCount < portfolios.length;

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 w-full">
        {displayedPortfolios.map((portfolio) => (
          <div key={portfolio.id} className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={portfolio.imgUrl || '/images/default-avatar.png'} 
              alt="포트폴리오 룩북 이미지" 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              loading="lazy"
            />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="w-full pt-8 pb-4 flex justify-center">
          <button 
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-300 hover:border-black hover:bg-gray-50 text-black rounded-full transition-all shadow-sm"
            title="더보기"
          >
            <span className="text-2xl font-light mb-1">+</span>
          </button>
        </div>
      )}
    </div>
  );
}
