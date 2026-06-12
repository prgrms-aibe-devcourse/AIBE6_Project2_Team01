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
    <div className="flex flex-wrap items-center gap-4 py-6 border-b border-hairline">
      {/* 성별 필터 예시 */}
      <select 
        value={searchParams.get('gender') || ''}
        onChange={(e) => updateFilter('gender', e.target.value)}
        className="h-11 px-4 bg-canvas-soft border border-hairline rounded-sm text-body-md"
      >
        <option value="">성별 전체</option>
        <option value="MALE">남성</option>
        <option value="FEMALE">여성</option>
      </select>
      
      {/* 정렬 필터 (우측 정렬을 위해 ml-auto 사용 가능) */}
      <div className="ml-auto">
        <select 
          value={searchParams.get('sort') || 'latest'}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="h-11 px-4 bg-canvas-soft border border-hairline rounded-sm text-body-md"
        >
          <option value="latest">최신순</option>
          <option value="recommended">추천순</option>
          <option value="rating">별점순</option>
        </select>
      </div>
    </div>
  );
}
