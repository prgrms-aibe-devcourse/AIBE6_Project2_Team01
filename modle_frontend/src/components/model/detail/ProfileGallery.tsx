'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Portfolio {
  id: number;
  imgUrl: string;
}

interface ProfileGalleryProps {
  portfolios: Portfolio[];
  mainFallback: string;
}

export function ProfileGallery({ portfolios, mainFallback }: ProfileGalleryProps) {
  const defaultImage = portfolios.length > 0 ? portfolios[0].imgUrl : mainFallback;
  const [activeImage, setActiveImage] = useState<string>(defaultImage);

  const thumbnails = portfolios.length > 0 ? portfolios : [{ id: 0, imgUrl: mainFallback }];

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden border border-gray-200">
        <Image
          src={activeImage || '/images/default-avatar.png'}
          alt="메인 모델 이미지"
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 400px"
          priority
        />
      </div>

      {thumbnails.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {thumbnails.map((thumb) => (
            <div 
              key={thumb.id}
              onClick={() => setActiveImage(thumb.imgUrl)}
              className={`relative w-16 h-20 shrink-0 cursor-pointer border-2 transition-colors ${
                activeImage === thumb.imgUrl ? 'border-black' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Image
                src={thumb.imgUrl || '/images/default-avatar.png'}
                alt="썸네일 이미지"
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
