import { Model } from '@/types/model';
import Image from 'next/image';
import { MouseEvent } from 'react';

interface Props {
  model: Model;
  bookmarked?: boolean;
  onBookmarkToggle?: (e: MouseEvent) => void;
  showBookmark?: boolean;
}

export function ModelCard({
  model,
  bookmarked = false,
  onBookmarkToggle,
  showBookmark = false,
}: Props) {
  const latestPortfolioImage =
    (model.portfolios && model.portfolios.length > 0 && model.portfolios[0].imgUrl)
      || model.profileImageUrl
      || '/placeholder.png';

  return (
    <div className="group cursor-pointer">
      {/* 상단 메인 이미지 */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
        <Image
          src={latestPortfolioImage}
          alt={model.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />

        {/* 북마크 버튼 (CLIENT만, 호버 시 노출) */}
        {showBookmark && onBookmarkToggle && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              type="button"
              onClick={onBookmarkToggle}
              aria-label={bookmarked ? "북마크 해제" : "북마크 추가"}
              className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center transition-colors border border-gray-200 shadow-sm hover:bg-black hover:text-white"
              style={{ color: bookmarked ? "#ef4444" : "#374151" }}
            >
              {bookmarked ? "♥" : "♡"}
            </button>
          </div>
        )}
      </div>

      {/* 하단 텍스트 */}
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-center">
          <h3 className="text-[14px] text-black font-extrabold tracking-widest uppercase">
            {model.name}
          </h3>
          <span className="text-[12px] text-gray-900 font-bold tracking-wider">
            ★ {model.rating} <span className="text-gray-400 font-normal">({model.reviewCount})</span>
          </span>
        </div>

        <p className="text-[12px] text-gray-500 font-medium mt-1">
          {model.region}
          {(model.height || model.weight) ? ' | ' : ''}
          {model.height ? `${model.height}cm ` : ''}
          {model.weight ? `${model.weight}kg` : ''}
        </p>

        {model.categories && model.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {model.categories.map((cat) => (
              <span
                key={cat}
                className="text-[10px] text-gray-500 uppercase font-bold tracking-wider border border-gray-200 px-1.5 py-0.5 bg-gray-50"
              >
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
