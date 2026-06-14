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
  const INITIAL_COUNT = 5;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400">
        추가 포트폴리오 이미지가 없습니다.
      </div>
    );
  }

  const displayedPortfolios = portfolios.slice(0, visibleCount);
  const hasMore = visibleCount < portfolios.length;

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className="w-full flex flex-col items-center gap-4 md:gap-8">
      {displayedPortfolios.map((portfolio) => (
        <div key={portfolio.id} className="w-full">
          <div className="relative w-full h-auto">
            <img 
              src={portfolio.imgUrl || '/images/default-avatar.png'} 
              alt="포트폴리오 룩북 이미지" 
              className="w-full h-auto block"
              loading="lazy"
            />
          </div>
        </div>
      ))}
      
      {hasMore && (
        <div className="w-full pt-8 pb-4 flex justify-center">
          <button 
            onClick={handleShowMore}
            className="w-full max-w-[400px] py-4 bg-white border border-gray-300 hover:border-black text-black font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            포트폴리오 더보기 ({portfolios.length - visibleCount}장 남음)
            <span className="text-[10px]">▼</span>
          </button>
        </div>
      )}
    </div>
  );
}
