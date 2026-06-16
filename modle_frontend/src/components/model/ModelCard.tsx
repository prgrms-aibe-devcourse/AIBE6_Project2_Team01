import { Model } from '@/types/model';
import Image from 'next/image';

export function ModelCard({ model }: { model: Model }) {
  // 포트폴리오 배열이 있다면 가장 마지막(최근) 사진을 메인으로 사용, 없으면 프로필 이미지, 그것도 없으면 기본 이미지
  const latestPortfolioImage = 
    (model.portfolios && model.portfolios.length > 0 && model.portfolios[model.portfolios.length - 1].imgUrl)
      || model.profileImageUrl 
      || '/placeholder.png';

  return (
    <div className="group cursor-pointer">
      {/* 상단 메인 이미지 (최근 포트폴리오) */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
        <Image 
          src={latestPortfolioImage} 
          alt={model.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* 호버 시 나타나는 찜(하트) 버튼 */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-black hover:bg-black hover:text-white transition-colors border border-gray-200 shadow-sm">
            ♡
          </button>
        </div>
      </div>

      {/* 하단 텍스트 영역 */}
      <div className="flex flex-col gap-1 px-1">
        <div className="flex justify-between items-center">
          <h3 className="text-[14px] text-black font-extrabold tracking-widest uppercase">{model.name}</h3>
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
            {model.categories.map(cat => (
              <span key={cat} className="text-[10px] text-gray-500 uppercase font-bold tracking-wider border border-gray-200 px-1.5 py-0.5 bg-gray-50">
                {cat}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
