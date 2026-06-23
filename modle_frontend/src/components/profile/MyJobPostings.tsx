'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyJobPostings, type MyJobPosting } from '@/lib/api/application';
import { REGION_OPTIONS } from '@/lib/constants/region';
import { STATUS_LABELS } from '@/lib/constants/jobPostingStatus';

const REGION_LABELS = Object.fromEntries(REGION_OPTIONS.map((o) => [o.value, o.label]));

const CATEGORY_LABELS: Record<string, string> = {
  HAIR: '헤어', MAKEUP: '메이크업', FITTING: '피팅',
  HAND: '핸드', FOOD: '음식', PRODUCT: '제품', ETC: '기타',
};


export function MyJobPostings() {
  const [items, setItems] = useState<MyJobPosting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    getMyJobPostings()
      .then(setItems)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : '불러오기에 실패했습니다.');
      })
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div className="py-20 text-center text-sm text-gray-500">로딩 중...</div>;
  if (error) return <div className="py-20 text-center text-sm text-red-500">{error}</div>;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">
          작성한 공고가 없습니다.
        </p>
        <Link href="/jobs/new" className="mt-4 inline-block text-sm text-black underline underline-offset-2">
          공고 등록하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-widest border-b-2 border-black pb-3 mb-6">
        등록한 공고
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.jobPostingId} className="border border-gray-200 bg-white p-5 hover:border-black transition-colors">
            <Link href={`/jobs/${item.jobPostingId}`} className="block mb-3">
              <h3 className="text-[15px] font-bold text-black leading-6 line-clamp-2 hover:underline underline-offset-2">
                {item.title}
              </h3>
            </Link>
            <dl className="space-y-1.5 text-[13px]">
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-gray-400">카테고리</dt>
                <dd className="font-medium text-black">{CATEGORY_LABELS[item.category] ?? item.category}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-gray-400">지역</dt>
                <dd className="font-medium text-black">{REGION_LABELS[item.region] ?? item.region}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-gray-400">상태</dt>
                <dd className="font-medium text-black">{STATUS_LABELS[item.status] ?? item.status}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-gray-400">인원</dt>
                <dd className="text-black">
                  <button
                    type="button"
                    onClick={() => router.push(`/jobs/${item.jobPostingId}/applicants`)}
                    className="underline underline-offset-2 hover:text-gray-600"
                  >
                    지원 {item.applicantCount}명
                  </button>
                  {' / '}선택 {item.contactedCount}명
                  {' / '}완료 {item.completedCount}명
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-16 shrink-0 text-gray-400">등록일</dt>
                <dd className="text-gray-500">
                  {new Date(item.createdDate).toLocaleDateString('ko-KR')}
                </dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
}
