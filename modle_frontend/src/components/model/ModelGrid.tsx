import { ModelCard } from './ModelCard';
import { Model } from '@/types/model';

export function ModelGrid({ models }: { models: Model[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {models.map(model => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  );
}
