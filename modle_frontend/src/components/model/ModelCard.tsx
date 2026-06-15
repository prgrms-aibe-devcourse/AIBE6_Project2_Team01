import { Model } from '@/types/model';
import Image from 'next/image';

export function ModelCard({ model }: { model: Model }) {
  // 포트폴리오 배열이 있다면 가장 마지막(최근) 사진을 메인으로 사용, 없으면 프로필 이미지, 그것도 없으면 기본 이미지
  const latestPortfolioImage = 
    (model.portfolios && model.portfolios.length > 0)
      ? model.portfolios[model.portfolios.length - 1].imgUrl
      : (model.profileImageUrl || '/placeholder.png');

  return (
    <div className="group border border-gray-200 bg-white hover:border-black transition-all hover:shadow-md cursor-pointer">
      {/* 상단 메인 이미지 (최근 포트폴리오) */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden">
        <Image 
          src={latestPortfolioImage} 
          alt={model.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* 하단 우측에 걸쳐진 동그란 프로필 이미지 */}
        <div className="absolute -bottom-5 right-4 w-12 h-12 rounded-full border-[3px] border-white overflow-hidden bg-white shadow-sm z-10">
          <Image 
            src={model.profileImageUrl || '/placeholder.png'} 
            alt={`${model.name} 프로필`}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* 하단 텍스트 영역 */}
      <div className="p-4 pt-6 relative border-t border-gray-100">
        <h3 className="text-lg text-black font-extrabold tracking-tight">{model.name}</h3>
        <p className="text-xs text-gray-500 mt-1 font-bold">
          {model.region} | ★ {model.rating} ({model.reviewCount})
        </p>
        
        {(model.age || model.height || model.weight) && (
          <p className="text-[11px] text-gray-400 mt-1.5 font-medium tracking-wide uppercase">
            {model.age ? `${model.age}세 ` : ''}
            {model.height ? `${model.height}cm ` : ''}
            {model.weight ? `${model.weight}kg` : ''}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mt-4">
          {model.categories?.map(cat => (
            <span key={cat} className="text-[10px] uppercase font-bold bg-black text-white px-2.5 py-1 tracking-wider">
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
