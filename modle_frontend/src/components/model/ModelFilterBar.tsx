'use client';

import { useRouter, useSearchParams } from 'next/navigation';

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
    router.push(`/models?${params.toString()}`);
  };

  // 단일 선택 필터 업데이트 함수 (성별, 키, 정렬, 검색 등)
  const updateSingleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    
    params.delete('page');
    router.push(`/models?${params.toString()}`);
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

  const regions = [
    { label: '서울', value: 'SEOUL' },
    { label: '부산', value: 'BUSAN' },
    { label: '대구', value: 'DAEGU' },
    { label: '인천', value: 'INCHEON' },
    { label: '광주', value: 'GWANGJU' },
    { label: '대전', value: 'DAEJEON' },
    { label: '울산', value: 'ULSAN' },
    { label: '세종', value: 'SEJONG' },
    { label: '경기', value: 'GYEONGGI' },
    { label: '강원', value: 'GANGWON' },
    { label: '충북', value: 'CHUNGBUK' },
    { label: '충남', value: 'CHUNGNAM' },
    { label: '전북', value: 'JEONBUK' },
    { label: '전남', value: 'JEONNAM' },
    { label: '경북', value: 'GYEONGBUK' },
    { label: '경남', value: 'GYEONGNAM' },
    { label: '제주', value: 'JEJU' },
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
    <div className="flex flex-col gap-5 py-8 border-b border-gray-200 text-sm bg-white">
      
      {/* 카테고리(분야) 다중 선택 필터 */}
      <div className="flex items-center gap-4">
        <span className="font-bold w-16 text-gray-400">분야</span>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateMultiFilter('categories', cat.value)}
              className={`px-4 py-2 rounded-full border transition-colors text-xs font-bold ${
                isActiveMulti('categories', cat.value)
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-black'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 지역 다중 선택 필터 */}
      <div className="flex items-center gap-4">
        <span className="font-bold w-16 text-gray-400">지역</span>
        <div className="flex flex-wrap gap-2">
          {regions.map((reg) => (
            <button
              key={reg.value}
              onClick={() => updateMultiFilter('regions', reg.value)}
              className={`px-4 py-2 rounded-full border transition-colors text-xs font-bold ${
                isActiveMulti('regions', reg.value)
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-black'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* 하단 유틸 필터 (성별, 키, 태그, 검색, 정렬) */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100 mt-2">
        <select 
          value={searchParams.get('gender') || ''}
          onChange={(e) => updateSingleFilter('gender', e.target.value)}
          className="h-10 px-3 bg-white border border-gray-200 text-black text-xs font-bold focus:outline-none focus:border-black hover:border-black transition-colors rounded-sm"
        >
          <option value="">성별 전체</option>
          <option value="MALE">남성</option>
          <option value="FEMALE">여성</option>
        </select>

        <select 
          value={searchParams.get('height') || ''}
          onChange={(e) => updateSingleFilter('height', e.target.value)}
          className="h-10 px-3 bg-white border border-gray-200 text-black text-xs font-bold focus:outline-none focus:border-black hover:border-black transition-colors rounded-sm"
        >
          <option value="">키 전체</option>
          <option value="under-160">160cm 이하</option>
          <option value="160-170">160-170cm</option>
          <option value="170-180">170-180cm</option>
          <option value="over-180">180cm 이상</option>
        </select>
        
        {/* 태그 입력창 */}
        <div className="flex items-center ml-auto">
          <input 
            type="text" 
            placeholder="# 태그 추가 (Enter)"
            onKeyDown={handleTagInput}
            className="h-10 px-3 bg-gray-50 border border-gray-200 text-black text-xs focus:outline-none focus:border-black hover:border-black transition-colors rounded-sm w-[140px] placeholder:text-gray-400"
          />
        </div>

        {/* 메인 검색창 */}
        <div className="relative flex-1 max-w-[240px]">
          <input 
            type="text" 
            placeholder="모델 이름 검색"
            defaultValue={searchParams.get('query') || ''}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateSingleFilter('query', e.currentTarget.value);
              }
            }}
            className="w-full h-10 pl-4 pr-10 bg-white border border-gray-200 text-black text-xs focus:outline-none focus:border-black hover:border-black transition-colors placeholder:text-gray-400 rounded-sm"
          />
          <button 
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              updateSingleFilter('query', input.value);
            }}
            className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </div>

        <select 
          value={searchParams.get('sort') || 'latest'}
          onChange={(e) => updateSingleFilter('sort', e.target.value)}
          className="h-10 px-3 bg-white border border-gray-200 text-black text-xs font-bold focus:outline-none focus:border-black hover:border-black transition-colors rounded-sm"
        >
          <option value="latest">최신순</option>
          <option value="recommended">추천순</option>
          <option value="rating">별점순</option>
        </select>
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
