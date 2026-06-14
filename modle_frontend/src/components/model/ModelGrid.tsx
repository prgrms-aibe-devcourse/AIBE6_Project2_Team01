import { Model } from '@/types/model';
import Link from 'next/link';
import { ModelCard } from './ModelCard';

export function ModelGrid({ models }: { models: Model[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {models.map(model => (
        <Link key={model.id} href={`/models/${model.id}`}>
          <ModelCard model={model} />
        </Link>
      ))}
    </div>
  );
}
