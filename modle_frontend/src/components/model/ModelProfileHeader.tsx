
import { Model } from '@/types/model';
import Image from "next/image";

interface Props {
  model: Model;
}

export function ModelProfileHeader({ model }: Props) {
  return (
    <div className="bg-canvas-soft rounded-2xl p-6 border border-hairline shadow-sm mb-8 flex flex-col md:flex-row gap-8">
      {/* Profile Image */}
      <div className="flex-shrink-0 relative w-48 h-48 md:w-64 md:h-64 rounded-xl overflow-hidden shadow-inner">
        <Image
          src={model.profileImageUrl || '/placeholder.png'}
          alt={`${model.name} 프로필 이미지`}
          fill
          className="object-cover"
        />
      </div>

      {/* Profile Info */}
      <div className="flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-display-md text-ink">{model.name}</h1>
            <div className="flex items-center bg-primary-soft text-primary px-3 py-1 rounded-full text-body-sm font-semibold">
              ★ {model.rating.toFixed(1)}{" "}
              <span className="text-mute ml-1">({model.reviewCount})</span>
            </div>
          </div>

          <div className="text-body text-mute mb-4 flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
            {model.region || "지역 미상"}
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {model.age && (
              <span className="px-3 py-1 bg-surface rounded-md border border-hairline text-body-sm text-body">
                {model.age}세
              </span>
            )}
            {model.height && (
              <span className="px-3 py-1 bg-surface rounded-md border border-hairline text-body-sm text-body">
                {model.height}cm
              </span>
            )}
            {model.weight && (
              <span className="px-3 py-1 bg-surface rounded-md border border-hairline text-body-sm text-body">
                {model.weight}kg
              </span>
            )}
            {model.sex !== undefined && (
              <span className="px-3 py-1 bg-surface rounded-md border border-hairline text-body-sm text-body">
                {model.sex === "M" ? "남성" : "여성"}
              </span>
            )}
          </div>

          {(model.categories && model.categories.length > 0) ||
          (model.tags && model.tags.length > 0) ? (
            <div className="mb-6">
              <h3 className="text-body-sm font-bold text-ink mb-2">
                카테고리 & 태그
              </h3>
              <div className="flex flex-wrap gap-2">
                {model.categories?.map((cat, idx) => (
                  <span
                    key={`cat-${idx}`}
                    className="px-2 py-1 bg-ink text-surface rounded text-body-sm"
                  >
                    {cat}
                  </span>
                ))}
                {model.tags?.map((tag, idx) => (
                  <span
                    key={`tag-${idx}`}
                    className="px-2 py-1 bg-canvas-soft border border-hairline text-mute rounded text-body-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex gap-4 mt-4">
          <button className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-colors shadow-md">
            작업 제안하기
          </button>
          <button className="px-6 py-3 bg-surface border border-hairline text-ink rounded-xl font-bold hover:bg-canvas transition-colors">
            찜하기
          </button>
        </div>
      </div>
    </div>
  );
}
