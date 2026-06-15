'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function ModelFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/models?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-4 py-6 border-b border-gray-200">
      {/* 성별 필터 */}
      <select 
        value={searchParams.get('gender') || ''}
        onChange={(e) => updateFilter('gender', e.target.value)}
        className="h-11 px-4 bg-white border border-gray-300 text-black text-xs font-bold tracking-wider hover:border-black focus:outline-none focus:border-black transition-colors"
      >
        <option value="">성별 전체</option>
        <option value="MALE">남성</option>
        <option value="FEMALE">여성</option>
      </select>

      {/* 활동 분야 필터 */}
      <select 
        value={searchParams.get('category') || ''}
        onChange={(e) => updateFilter('category', e.target.value)}
        className="h-11 px-4 bg-white border border-gray-300 text-black text-xs font-bold tracking-wider hover:border-black focus:outline-none focus:border-black transition-colors"
      >
        <option value="">활동 분야 전체</option>
        <option value="fashion">패션</option>
        <option value="commercial">광고</option>
        <option value="magazine">매거진</option>
        <option value="beauty">뷰티</option>
      </select>

      {/* 지역 필터 */}
      <select 
        value={searchParams.get('region') || ''}
        onChange={(e) => updateFilter('region', e.target.value)}
        className="h-11 px-4 bg-white border border-gray-300 text-black text-xs font-bold tracking-wider hover:border-black focus:outline-none focus:border-black transition-colors"
      >
        <option value="">지역 전체</option>
        <option value="seoul">서울</option>
        <option value="gyeonggi">경기</option>
        <option value="busan">부산</option>
        <option value="incheon">인천</option>
      </select>

      {/* 키 필터 */}
      <select 
        value={searchParams.get('height') || ''}
        onChange={(e) => updateFilter('height', e.target.value)}
        className="h-11 px-4 bg-white border border-gray-300 text-black text-xs font-bold tracking-wider hover:border-black focus:outline-none focus:border-black transition-colors"
      >
        <option value="">키 전체</option>
        <option value="under-160">160cm 이하</option>
        <option value="160-170">160-170cm</option>
        <option value="170-180">170-180cm</option>
        <option value="over-180">180cm 이상</option>
      </select>
      
      {/* 검색 바 */}
      <div className="relative min-w-[200px] flex-1 max-w-[320px]">
        <input 
          type="text" 
          placeholder="검색어를 입력하세요"
          defaultValue={searchParams.get('query') || ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateFilter('query', e.currentTarget.value);
            }
          }}
          className="w-full h-11 pl-4 pr-10 bg-white border border-gray-300 text-black text-xs font-bold tracking-wider hover:border-black focus:outline-none focus:border-black transition-colors placeholder:font-normal placeholder:text-gray-400"
        />
        <button 
          onClick={(e) => {
            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
            updateFilter('query', input.value);
          }}
          className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </button>
      </div>

      {/* 정렬 필터 (우측 정렬을 위해 ml-auto 사용 가능) */}
      <div className="ml-auto">
        <select 
          value={searchParams.get('sort') || 'latest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="h-11 px-4 bg-white border border-gray-300 text-black text-xs font-bold tracking-wider hover:border-black focus:outline-none focus:border-black transition-colors"
        >
          <option value="latest">최신순</option>
          <option value="recommended">추천순</option>
          <option value="rating">별점순</option>
        </select>
      </div>
    </div>
  );
}
