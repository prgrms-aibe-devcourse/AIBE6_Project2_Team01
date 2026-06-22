import { ModelFilterBar } from '@/components/model/ModelFilterBar';
import { ModelGrid } from '@/components/model/ModelGrid';
import { getModels } from '@/lib/api/model';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ModelsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getModels(params);

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12 bg-white text-ink font-sans selection:bg-ink selection:text-white">
      <header className="relative overflow-hidden rounded-[2rem] bg-ink px-10 py-16 shadow-2xl mb-10 text-canvas">
        {/* Background image with opacity */}
        <div className="absolute inset-0">
          <img src="/images/models_banner.png" alt="Runway Model Background" className="w-full h-full object-cover object-[center_15%] opacity-30 mix-blend-luminosity" />
        </div>
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

        {/* Text Content */}
        <div className="relative z-10 flex flex-col justify-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wider text-white w-max">
            DISCOVER MODELS
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            모델 찾기
          </h1>
          <p className="mt-4 max-w-[400px] text-[16px] leading-relaxed text-gray-300 font-medium">
            모들의 전문 모델들을 만나보세요. 다양한 필터를 통해 완벽한 파트너를 찾을 수 있습니다.
          </p>
        </div>
      </header>
      
      <ModelFilterBar />
      
      <div className="mt-8">
        <div className="flex justify-between items-end mb-4 px-2">
          <div className="text-sm font-bold text-gray-700">
            총 {data.totalElements}명의 모델
          </div>
        </div>
        <ModelGrid 
          models={data.models} 
          totalPages={data.totalPages} 
          currentPage={Number(params.page) || 0}
          searchParams={params}
        />
        {data.models.length === 0 && (
          <div className="py-20 text-center border border-gray-200 bg-gray-50 mt-8">
            <p className="text-sm font-bold text-gray-400 tracking-wider">조건에 맞는 모델이 없습니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}
