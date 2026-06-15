import { ModelFilterBar } from '@/components/model/ModelFilterBar';
import { ModelGrid } from '@/components/model/ModelGrid';
import { getModels } from '@/lib/api/model';

interface PageProps {
  searchParams: Promise<{ [key: string]: string }>;
}

export default async function ModelsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getModels(params);

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-display-lg text-ink">모델 찾기</h1>
        <p className="text-body-lg text-body mt-2">모들의 전문 모델들을 만나보세요.</p>
      </header>
      
      <ModelFilterBar />
      
      <div className="mt-8">
        <ModelGrid models={data.models} />
        {data.models.length === 0 && (
          <div className="py-20 text-center bg-canvas-soft rounded-lg border border-hairline">
            <p className="text-body-md text-mute">조건에 맞는 모델이 없습니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}
