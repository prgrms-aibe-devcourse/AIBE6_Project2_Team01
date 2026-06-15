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
