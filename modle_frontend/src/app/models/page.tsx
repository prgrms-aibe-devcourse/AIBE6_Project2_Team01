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
    <main className="max-w-[1200px] mx-auto px-6 py-12 bg-white text-black font-sans selection:bg-black selection:text-white">
      <header className="mb-10 border-b-2 border-black pb-6 text-center">
        <h1 className="text-4xl font-black text-black tracking-tighter uppercase">모델 찾기</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">모들의 전문 모델들을 만나보세요</p>
      </header>
      
      <ModelFilterBar />
      
      <div className="mt-8">
        <ModelGrid models={data.models} />
        {data.models.length === 0 && (
          <div className="py-20 text-center border border-gray-200 bg-gray-50 mt-8">
            <p className="text-sm font-bold text-gray-400 tracking-wider">조건에 맞는 모델이 없습니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}
