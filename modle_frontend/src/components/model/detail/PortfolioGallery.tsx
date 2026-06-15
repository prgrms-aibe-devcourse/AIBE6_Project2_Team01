'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Portfolio {
  id: number;
  imgUrl: string;
}

interface PortfolioGalleryProps {
  portfolios: Portfolio[];
  fallbackImage?: string;
}

export function PortfolioGallery({ portfolios, fallbackImage = '/images/default-avatar.png' }: PortfolioGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="w-full py-16 bg-white flex items-center justify-center rounded-2xl border border-gray-200">
        <p className="text-gray-400 font-medium text-sm">등록된 포트폴리오가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 
        핀터레스트 스타일 Masonry 그리드 (CSS columns 사용)
        모바일에서는 2단, 데스크탑에서는 3단으로 구성하여
        다양한 세로 비율의 이미지들이 벽돌처럼 촘촘히 쌓이게 합니다.
      */}
      <div className="columns-2 md:columns-3 gap-2 md:gap-3 space-y-2 md:space-y-3">
        {portfolios.map((portfolio, idx) => {
          // 사진들의 세로 비율을 랜덤하게 주어 매이슨리(Masonry) 느낌을 살립니다. (실제 데이터에 높이값이 없다면 임의 지정)
          // 여기서는 3가지 높이 비율(tall, medium, short)을 번갈아 적용합니다.
          const heightClass = idx % 3 === 0 ? 'aspect-[3/4]' : idx % 3 === 1 ? 'aspect-[4/5]' : 'aspect-square';

          return (
            <div 
              key={portfolio.id} 
              className={`relative w-full ${heightClass} break-inside-avoid bg-gray-100 rounded-lg overflow-hidden cursor-pointer group shadow-sm`}
              onClick={() => setSelectedImage(portfolio.imgUrl)}
            >
              <Image
                src={portfolio.imgUrl || fallbackImage}
                alt="포트폴리오 이미지"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          );
        })}
      </div>

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
