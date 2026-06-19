'use client';

import { useEffect, useRef, useState } from 'react';
import { getMyCareer, updateCareerPublic, type CareerItem } from '@/lib/api/career';
import { Toast, type ToastState } from '@/components/ui/Toast';
import { REGION_OPTIONS } from '@/lib/constants/region';

const REGION_LABELS = Object.fromEntries(REGION_OPTIONS.map((o) => [o.value, o.label]));

const CATEGORY_LABELS: Record<string, string> = {
  HAIR: '헤어', MAKEUP: '메이크업', CLOTHING: '의류', FITTING: '피팅',
  HAND: '핸드', FOOD: '음식', PRODUCT: '제품', ETC: '기타',
};

export function MyCareerList() {
  const [items, setItems] = useState<CareerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(next: ToastState) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    getMyCareer()
      .then(setItems)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : '불러오기에 실패했습니다.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleTogglePublic(career: CareerItem) {
    setTogglingIds((prev) => new Set(prev).add(career.id));
    try {
      const updated = await updateCareerPublic(career.id, !career.isPublic);
      setItems((prev) => prev.map((item) => (item.id === career.id ? updated : item)));
      showToast({
        type: 'success',
        message: updated.isPublic ? '경력을 공개로 변경했습니다.' : '경력을 비공개로 변경했습니다.',
      });
    } catch (e) {
      showToast({ type: 'error', message: e instanceof Error ? e.message : '변경에 실패했습니다.' });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(career.id);
        return next;
      });
    }
  }

  if (isLoading) return <div className="py-20 text-center text-sm text-gray-500">로딩 중...</div>;
  if (error) return <div className="py-20 text-center text-sm text-red-500">{error}</div>;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">
          아직 완료된 촬영이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast toast={toast} />}
      <div>
        <h2 className="text-xl font-black uppercase tracking-widest border-b-2 border-black pb-3 mb-6">
          경력 사항
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((career) => (
            <li key={career.id} className="border border-gray-200 bg-white p-5">
              <h3 className="text-[15px] font-bold text-black leading-6 line-clamp-2 mb-3">
                {career.title}
              </h3>
              <dl className="space-y-1.5 text-[13px]">
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-gray-400">카테고리</dt>
                  <dd className="font-medium text-black">
                    {CATEGORY_LABELS[career.category] ?? career.category}
                  </dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-gray-400">지역</dt>
                  <dd className="font-medium text-black">
                    {REGION_LABELS[career.region] ?? career.region}
                  </dd>
                </div>
                {career.shootDate && (
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-gray-400">촬영일</dt>
                    <dd className="text-gray-500">
                      {new Date(career.shootDate).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                )}
                {career.completedDate && (
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-gray-400">완료일</dt>
                    <dd className="text-gray-500">
                      {new Date(career.completedDate).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="w-16 shrink-0 text-gray-400">공개 여부</dt>
                  <dd className={`font-medium ${career.isPublic ? 'text-black' : 'text-gray-400'}`}>
                    {career.isPublic ? '공개' : '비공개'}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => handleTogglePublic(career)}
                disabled={togglingIds.has(career.id)}
                className={`mt-4 h-9 w-full border text-[13px] font-semibold transition disabled:opacity-50 ${
                  career.isPublic
                    ? 'border-gray-300 text-gray-600 hover:border-black hover:text-black'
                    : 'border-black bg-black text-white hover:opacity-85'
                }`}
              >
                {togglingIds.has(career.id)
                  ? '변경 중...'
                  : career.isPublic
                    ? '비공개로 변경'
                    : '공개로 변경'}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
