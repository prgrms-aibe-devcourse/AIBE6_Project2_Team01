import { Model } from '@/types/model';
import Image from 'next/image';
import { MouseEvent } from 'react';

interface Props {
  model: Model;
  // 장식용 ♡ (비활성 플레이스홀더) — 추천 카드 등에서 false로 숨김
  showFavoriteButton?: boolean;
  // 기능형 북마크 (CLIENT 전용)
  bookmarked?: boolean;
  onBookmarkToggle?: (e: MouseEvent) => void;
  showBookmark?: boolean;
}

export function ModelCard({
  model,
  showFavoriteButton = false,
  bookmarked = false,
  onBookmarkToggle,
  showBookmark = false,
}: Props) {
  // 포트폴리오가 있으면 가장 최근 사진, 없으면 프로필 이미지, 그것도 없으면 기본 이미지
  const latestPortfolioImage =
    (model.portfolios && model.portfolios.length > 0 && model.portfolios[0].imgUrl)
      || model.profileImageUrl
      || '/placeholder.png';

  return (
    <div className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-hairline transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 hover:border-hairline-strong">
      {/* 상단 메인 이미지 */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <Image
          src={latestPortfolioImage}
          alt={model.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        {/* 북마크 버튼 (CLIENT만, 호버 시 노출) — 없으면 장식용 ♡ */}
        {showBookmark && onBookmarkToggle ? (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              type="button"
              onClick={onBookmarkToggle}
              aria-label={bookmarked ? "북마크 해제" : "북마크 추가"}
              className="w-9 h-9 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm hover:bg-ink hover:text-white hover:scale-110"
              style={{ color: bookmarked ? "#ef4444" : "#374151" }}
            >
              {bookmarked ? "♥" : "♡"}
            </button>
          </div>
        ) : showFavoriteButton ? (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              type="button"
              className="w-9 h-9 bg-white/60 backdrop-blur-md rounded-full flex items-center justify-center text-ink transition-all shadow-sm hover:bg-ink hover:text-white hover:scale-110"
            >
              ♡
            </button>
          </div>
        ) : null}
        
        {/* Hover Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>

      {/* 하단 텍스트 */}
      <div className="flex flex-col p-4 bg-white/80 backdrop-blur-sm relative flex-1">
        <div className="flex justify-between items-center pr-1 mb-1">
          <h3 className="text-[15px] text-ink font-extrabold tracking-wide">
            {model.name}
          </h3>
          <span className="text-[13px] text-ink font-bold flex items-center gap-1 bg-gray-50 px-2 py-0.5 rounded-full">
            <span className="text-yellow-400">★</span> {model.rating} <span className="text-gray-400 font-medium">({model.reviewCount})</span>
          </span>
        </div>

        <div className="flex justify-between items-end flex-1 mt-1">
          <div className="flex flex-col gap-1 h-full justify-start">
            <p className="text-[13px] text-body font-medium">
              {model.region}
              {(model.height || model.weight) ? <span className="mx-1.5 text-gray-300">|</span> : ''}
              {model.height ? `${model.height}cm ` : ''}
              {model.weight ? `${model.weight}kg` : ''}
            </p>

            {model.categories && model.categories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-[180px]">
                {model.categories.map((cat) => (
                  <span
                    key={cat}
                    className="text-[11px] text-ink font-semibold tracking-wide border border-hairline px-2 py-1 bg-canvas rounded-md shadow-sm"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 우측 하단 원형 프로필 이미지 (별점 아래) */}
          <div className="w-10 h-10 shrink-0 rounded-full overflow-hidden border border-gray-200 shadow-sm bg-gray-50 relative ml-2 mb-1">
            <Image
              src={model.profileImageUrl || '/placeholder.png'}
              alt={`${model.name} profile`}
              fill
              className="object-cover"
              onError={(e) => {
                e.currentTarget.srcset = '/placeholder.png';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
