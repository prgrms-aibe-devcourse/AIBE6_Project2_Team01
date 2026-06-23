'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  getMyApplications,
  cancelApplication,
  APPLICATION_STATUS_LABELS,
  type MyApplication,
} from '@/lib/api/application';
import { ReviewModal } from '@/components/review/ReviewModal';
import { REGION_OPTIONS } from '@/lib/constants/region';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Toast, type ToastState } from '@/components/ui/Toast';

const REGION_LABELS = Object.fromEntries(REGION_OPTIONS.map((o) => [o.value, o.label]));

const CATEGORY_LABELS: Record<string, string> = {
  HAIR: '헤어', MAKEUP: '메이크업', FITTING: '피팅',
  HAND: '핸드', FOOD: '음식', PRODUCT: '제품', ETC: '기타',
};

export function MyApplications() {
  const [items, setItems] = useState<MyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingIds, setCancellingIds] = useState<Set<number>>(new Set());
  const [confirmTarget, setConfirmTarget] = useState<number | null>(null);
  const [reviewTarget, setReviewTarget] = useState<MyApplication | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(next: ToastState) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(next);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  async function handleConfirmCancel() {
    if (confirmTarget === null) return;
    const applicationId = confirmTarget;
    setConfirmTarget(null);
    setCancellingIds((prev) => new Set(prev).add(applicationId));
    try {
      await cancelApplication(applicationId);
      setItems((prev) =>
        prev.map((item) =>
          item.applicationId === applicationId
            ? { ...item, status: 'APPLICATION_CANCELLED' }
            : item
        )
      );
      showToast({ type: 'success', message: '지원이 취소되었습니다.' });
    } catch (e) {
      showToast({ type: 'error', message: e instanceof Error ? e.message : '취소에 실패했습니다.' });
    } finally {
      setCancellingIds((prev) => {
        const next = new Set(prev);
        next.delete(applicationId);
        return next;
      });
    }
  }

  function handleReviewSuccess() {
    if (reviewTarget) {
      setReviewedIds((prev) => new Set(prev).add(reviewTarget.applicationId));
      showToast({ type: 'success', message: '리뷰가 작성됐습니다.' });
    }
    setReviewTarget(null);
  }

  useEffect(() => {
    getMyApplications()
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
          지원한 공고가 없습니다.
        </p>
        <Link href="/jobs" className="mt-4 inline-block text-sm text-black underline underline-offset-2">
          공고 목록 보러 가기
        </Link>
      </div>
    );
  }

  return (
    <>
      {confirmTarget !== null && (
        <ConfirmDialog
          title="지원을 취소하시겠습니까?"
          description="취소 후에는 되돌릴 수 없습니다."
          confirmLabel="지원 취소"
          onConfirm={handleConfirmCancel}
          onClose={() => setConfirmTarget(null)}
        />
      )}
      {reviewTarget && (
        <ReviewModal
          applicationId={reviewTarget.applicationId}
          targetName={reviewTarget.jobPostingTitle}
          onSuccess={handleReviewSuccess}
          onClose={() => setReviewTarget(null)}
        />
      )}
      {toast && <Toast toast={toast} />}
      <div>
        <h2 className="text-xl font-black uppercase tracking-widest border-b-2 border-black pb-3 mb-6">
          지원한 공고
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.applicationId} className="border border-gray-200 bg-white hover:border-black transition-colors">
              <Link href={`/jobs/${item.jobPostingId}`} className="block p-5">
                <h3 className="text-[15px] font-bold text-black leading-6 line-clamp-2 mb-3">
                  {item.jobPostingTitle}
                </h3>
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
                    <dt className="w-16 shrink-0 text-gray-400">지원 상태</dt>
                    <dd className="font-medium text-black">
                      {APPLICATION_STATUS_LABELS[item.status] ?? item.status}
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-gray-400">촬영 여부</dt>
                    <dd className="font-medium text-black">{item.shooting ? '✓' : '-'}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-16 shrink-0 text-gray-400">지원일</dt>
                    <dd className="text-gray-500">
                      {new Date(item.appliedDate).toLocaleDateString('ko-KR')}
                    </dd>
                  </div>
                </dl>
              </Link>
              <div className="px-5 pb-4 space-y-2">
                {item.status === 'APPLIED' && (
                  <button
                    type="button"
                    onClick={() => setConfirmTarget(item.applicationId)}
                    disabled={cancellingIds.has(item.applicationId)}
                    className="w-full rounded border border-red-300 py-1.5 text-[13px] text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                  >
                    {cancellingIds.has(item.applicationId) ? '취소 중...' : '지원 취소'}
                  </button>
                )}
                {item.status === 'COMPLETED' && (
                  <button
                    type="button"
                    onClick={() => setReviewTarget(item)}
                    disabled={reviewedIds.has(item.applicationId)}
                    className="w-full border border-black py-1.5 text-[13px] font-semibold text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    {reviewedIds.has(item.applicationId) ? '리뷰 완료' : '리뷰 작성'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
