'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { CATEGORY_OPTIONS, getCategoryLabel } from '@/lib/constants/category';

interface Portfolio {
  id: number;
  imgUrl: string;
  category?: string;
}

interface DetailLookbookProps {
  portfolios: Portfolio[];
}

export function DetailLookbook({ portfolios }: DetailLookbookProps) {
  const INITIAL_COUNT = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const categories = CATEGORY_OPTIONS.map(opt => opt.value);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const filteredPortfolios = portfolios.filter(p => 
    selectedCategories.length === 0 || (p.category && selectedCategories.includes(p.category))
  );

  const getCategoryCount = (category: string) => {
    return portfolios.filter(p => p.category === category).length;
  };

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="w-full py-16 bg-white flex items-center justify-center rounded-2xl border border-gray-200">
        <p className="text-gray-400 font-medium text-sm">등록된 포트폴리오 이미지가 없습니다.</p>
      </div>
    );
  }

  // 프론트엔드 강제 정렬 제거: 백엔드에서 내려주는 displayOrder 기준 배열 순서를 그대로 따름
  const displayedPortfolios = filteredPortfolios.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPortfolios.length;

  return (
    <div className="w-full">
      {/* 필터 영역 */}
      <div className="flex justify-between items-center mb-4 relative" ref={filterRef}>
        <div className="text-sm font-bold text-gray-700">총 {filteredPortfolios.length}개</div>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          필터 {selectedCategories.length > 0 && `(${selectedCategories.length})`}
        </button>

        {isFilterOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2">
            {categories.map(cat => (
              <label key={cat} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(cat)} 
                  onChange={() => handleCategoryChange(cat)}
                  className="rounded border-gray-300 accent-black w-4 h-4"
                />
                <span className="text-sm text-gray-700">{getCategoryLabel(cat)} ({getCategoryCount(cat)})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {filteredPortfolios.length === 0 && selectedCategories.length > 0 && (
        <div className="w-full py-16 bg-white flex items-center justify-center rounded-2xl border border-gray-200">
          <p className="text-gray-400 font-medium text-sm">해당 카테고리의 포트폴리오가 없습니다.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 w-full">
        {displayedPortfolios.map((portfolio) => (
          <div 
            key={portfolio.id} 
            className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden cursor-pointer group shadow-sm"
            onClick={() => setSelectedImage(portfolio.imgUrl)}
          >
            <Image
              src={portfolio.imgUrl || '/images/default-avatar.png'}
              alt="포트폴리오 룩북 이미지"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 33vw"
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

      {/* ================= 크게 보기 모달 ================= */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white text-4xl hover:text-gray-300 transition-colors z-[101]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            &times;
          </button>
          
          <div 
            className="relative w-full max-w-5xl h-[80vh] md:h-[95vh] bg-transparent rounded-lg overflow-hidden flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} 
          >
            <Image
              src={selectedImage}
              alt="포트폴리오 상세 이미지"
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
