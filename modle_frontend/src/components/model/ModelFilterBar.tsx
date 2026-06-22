'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { REGION_OPTIONS } from '@/lib/constants/region';

export function ModelFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 다중 선택 필터 업데이트 함수 (카테고리, 지역 등)
  const updateMultiFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const currentValues = params.getAll(key);
    
    params.delete(key);
    if (currentValues.includes(value)) {
      // 선택 해제
      currentValues.filter(v => v !== value).forEach(v => params.append(key, v));
    } else {
      // 선택 추가
      currentValues.forEach(v => params.append(key, v));
      params.append(key, value);
    }
    
    // 필터 변경 시 첫 페이지로 리셋
    params.delete('page');
    router.push(`/models?${params.toString()}`, { scroll: false });
  };

  // 단일 선택 필터 업데이트 함수 (성별, 키, 정렬, 검색 등)
  const updateSingleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    
    params.delete('page');
    router.push(`/models?${params.toString()}`, { scroll: false });
  };

  // 멀티 필터 항목이 선택되어 있는지 확인하는 함수
  const isActiveMulti = (key: string, value: string) => searchParams.getAll(key).includes(value);

  // 옵션 데이터
  const categories = [
    { label: '헤어', value: 'HAIR' },
    { label: '메이크업', value: 'MAKEUP' },
    { label: '의류', value: 'CLOTHING' },
    { label: '피팅', value: 'FITTING' },
    { label: '핸드', value: 'HAND' },
    { label: '음식', value: 'FOOD' },
    { label: '제품', value: 'PRODUCT' },
    { label: '기타', value: 'ETC' },
  ];



  // 태그 입력 핸들러
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.currentTarget;
      let value = input.value.trim();
      if (value.startsWith('#')) {
        value = value.substring(1);
      }
      
      if (value && !searchParams.getAll('tags').includes(value)) {
        updateMultiFilter('tags', value);
      }
      input.value = '';
    }
  };
  return (
    <div className="flex flex-col gap-6 py-8">
      
      {/* 카테고리(분야) 다중 선택 필터 */}
      <div className="flex items-start gap-4">
        <span className="font-black w-14 text-gray-800 pt-2 tracking-widest text-[13px]">분야</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateMultiFilter('categories', cat.value)}
              className={`px-5 py-2.5 rounded-full transition-all text-[13px] font-bold shadow-sm ${
                isActiveMulti('categories', cat.value)
                  ? 'bg-black text-white shadow-md scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 지역 다중 선택 필터 */}
      <div className="flex items-start gap-4">
        <span className="font-black w-14 text-gray-800 pt-2 tracking-widest text-[13px]">지역</span>
        <div className="flex flex-wrap gap-2">
          {REGION_OPTIONS.map((reg) => (
            <button
              key={reg.value}
              onClick={() => updateMultiFilter('regions', reg.value)}
              className={`px-5 py-2.5 rounded-full transition-all text-[13px] font-bold shadow-sm ${
                isActiveMulti('regions', reg.value)
                  ? 'bg-black text-white shadow-md scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* 하단 유틸 필터 (성별, 키, 태그, 검색, 정렬) */}
      <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 mt-2">
        <div className="relative">
          <select 
            value={searchParams.get('gender') || ''}
            onChange={(e) => updateSingleFilter('gender', e.target.value)}
            className="h-12 pl-5 pr-10 bg-white border border-gray-200 text-gray-800 text-[13px] font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black hover:border-black transition-all rounded-full shadow-sm cursor-pointer appearance-none"
          >
            <option value="">성별 전체</option>
            <option value="MALE">남성</option>
            <option value="FEMALE">여성</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div className="relative">
          <select 
            value={searchParams.get('height') || ''}
            onChange={(e) => updateSingleFilter('height', e.target.value)}
            className="h-12 pl-5 pr-10 bg-white border border-gray-200 text-gray-800 text-[13px] font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black hover:border-black transition-all rounded-full shadow-sm cursor-pointer appearance-none"
          >
            <option value="">키 전체</option>
            <option value="under-160">160cm 이하</option>
            <option value="160-170">160-170cm</option>
            <option value="170-180">170-180cm</option>
            <option value="over-180">180cm 이상</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div className="relative">
          <select 
            value={searchParams.get('weight') || ''}
            onChange={(e) => updateSingleFilter('weight', e.target.value)}
            className="h-12 pl-5 pr-10 bg-white border border-gray-200 text-gray-800 text-[13px] font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black hover:border-black transition-all rounded-full shadow-sm cursor-pointer appearance-none"
          >
            <option value="">몸무게 전체</option>
            <option value="under-50">50kg 이하</option>
            <option value="50-60">50-60kg</option>
            <option value="60-70">60-70kg</option>
            <option value="70-80">70-80kg</option>
            <option value="over-80">80kg 이상</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
        
        {/* 태그 입력창 */}
        <div className="flex items-center ml-auto">
          <input 
            type="text" 
            placeholder="# 태그 추가 (Enter)"
            onKeyDown={handleTagInput}
            className="h-12 px-5 bg-white border border-gray-200 text-black text-[13px] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black hover:border-black transition-all rounded-full w-[160px] placeholder:text-gray-400 shadow-sm"
          />
        </div>

        {/* 메인 검색창 */}
        <div className="relative flex-1 max-w-[280px]">
          <input 
            type="text" 
            placeholder="모델 이름 검색"
            defaultValue={searchParams.get('query') || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateSingleFilter('query', e.currentTarget.value);
              }
            }}
            className="w-full h-12 pl-6 pr-12 bg-white border border-gray-200 text-black text-[13px] font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black hover:border-black transition-all placeholder:text-gray-400 rounded-full shadow-sm"
          />
          <button 
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              updateSingleFilter('query', input.value);
            }}
            className="absolute right-2 top-1 h-10 w-10 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>

        <div className="relative">
          <select 
            value={searchParams.get('sort') || 'latest'}
            onChange={(e) => updateSingleFilter('sort', e.target.value)}
            className="h-12 pl-5 pr-10 bg-white border border-gray-200 text-gray-800 text-[13px] font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black hover:border-black transition-all rounded-full shadow-sm cursor-pointer appearance-none"
          >
            <option value="latest">최신순</option>
            <option value="recommended">추천순</option>
            <option value="rating">별점순</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* 생성된 태그 칩 (입력창 하단에 고정) */}
      {searchParams.getAll('tags').length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {searchParams.getAll('tags').map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black text-white text-xs font-bold shadow-sm"
            >
              <span>#{tag}</span>
              <button
                onClick={() => updateMultiFilter('tags', tag)}
                className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label="태그 삭제"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
