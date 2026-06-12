import Image from 'next/image';
import { Model } from '@/types/model';

export function ModelCard({ model }: { model: Model }) {
  return (
    <div className="group border border-hairline rounded-lg overflow-hidden bg-surface hover:border-hairline-strong transition-colors">
      <div className="relative aspect-[3/4] bg-canvas-soft">
        <Image 
          src={model.profileImageUrl || '/placeholder.png'} 
          alt={model.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-title text-ink font-semibold">{model.name}</h3>
        <p className="text-body-sm text-mute mt-1">
          {model.region} | ★ {model.rating} ({model.reviewCount})
        </p>
        <div className="flex flex-wrap gap-1 mt-3">
          {model.categories.map(cat => (
            <span key={cat} className="text-[11px] bg-canvas-soft text-body px-2 py-0.5 rounded-full border border-hairline">
              {cat}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
