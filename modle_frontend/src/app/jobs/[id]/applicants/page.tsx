'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getApplicants, type ApplicantInfo } from '@/lib/api/application';
import { ApplicantList } from '@/components/application/ApplicantList';

export default function ApplicantsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const jobId = Number(id);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [applicants, setApplicants] = useState<ApplicantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    // 비로그인 또는 CLIENT 아님 → 홈으로
    if (!user || user.role !== 'CLIENT') {
      router.replace('/');
      return;
    }

    getApplicants(jobId)
      .then(setApplicants)
      .catch((e: unknown) => {
        const status = (e as { status?: number }).status;
        if (status === 403) {
          setError('접근 권한이 없습니다.');
          setTimeout(() => router.replace('/'), 2000);
        } else {
          setError(e instanceof Error ? e.message : '지원자 목록을 불러오지 못했습니다.');
        }
      })
      .finally(() => setLoading(false));
  }, [authLoading, user, jobId, router]);

  if (authLoading || (loading && !error)) {
    return (
      <main className="min-h-screen bg-canvas">
        <p className="py-20 text-center text-[15px] text-mute">로딩 중...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-canvas">
        <p className="py-20 text-center text-[15px] text-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-hairline pb-6 mb-8">
          <h1 className="text-[24px] font-bold text-ink">지원자 목록</h1>
          <p className="mt-1 text-[13px] text-mute">총 {applicants.length}명</p>
        </header>

        <ApplicantList applicants={applicants} />

        <div className="pt-8">
          <Link
            href={`/jobs/${jobId}`}
            className="text-[14px] text-mute underline-offset-2 hover:underline"
          >
            ← 공고로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
