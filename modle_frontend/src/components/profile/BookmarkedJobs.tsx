"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addJobBookmark,
  getJobBookmarks,
  removeJobBookmark,
  type JobBookmark,
} from "@/lib/api/bookmark";

const CATEGORY_LABELS: Record<string, string> = {
  HAIR: "헤어", MAKEUP: "메이크업", FITTING: "피팅",
  HAND: "핸드", FOOD: "음식", PRODUCT: "제품", ETC: "기타",
};

const REGION_LABELS: Record<string, string> = {
  SEOUL: "서울", BUSAN: "부산", DAEGU: "대구", INCHEON: "인천",
  GWANGJU: "광주", DAEJEON: "대전", ULSAN: "울산", SEJONG: "세종",
  GYEONGGI: "경기", GANGWON: "강원", CHUNGBUK: "충북", CHUNGNAM: "충남",
  JEONBUK: "전북", JEONNAM: "전남", GYEONGBUK: "경북", GYEONGNAM: "경남", JEJU: "제주",
};

export function BookmarkedJobs() {
  const [jobs, setJobs] = useState<JobBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [undoTarget, setUndoTarget] = useState<JobBookmark | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getJobBookmarks()
      .then(setJobs)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current); }, []);

  const handleRemove = async (job: JobBookmark) => {
    // 낙관적 제거
    setJobs((prev) => prev.filter((j) => j.jobPostingId !== job.jobPostingId));

    // 이전 Undo 타이머 초기화
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoTarget(job);
    undoTimer.current = setTimeout(() => setUndoTarget(null), 5000);

    try {
      await removeJobBookmark(job.jobPostingId);
    } catch {
      // API 실패 시 롤백
      setJobs((prev) => [job, ...prev]);
      setUndoTarget(null);
    }
  };

  const handleUndo = async () => {
    if (!undoTarget) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    const target = undoTarget;
    setUndoTarget(null);
    // 낙관적 복원
    setJobs((prev) => [target, ...prev]);
    try {
      await addJobBookmark(target.jobPostingId);
    } catch {
      setJobs((prev) => prev.filter((j) => j.jobPostingId !== target.jobPostingId));
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return <div className="py-20 text-center text-sm text-red-500">{error}</div>;
  }

  if (jobs.length === 0 && !undoTarget) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">
          북마크한 공고가 없습니다.
        </p>
        <Link href="/jobs" className="mt-4 inline-block text-sm text-black underline underline-offset-2">
          공고 목록 보러 가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-widest border-b-2 border-black pb-3 mb-6">
        즐겨찾기한 공고
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {jobs.map((job) => (
          <li key={job.jobPostingId} className="relative group/card">
            <Link
              href={`/jobs/${job.jobPostingId}`}
              className="block border border-gray-200 bg-white p-5 hover:border-black transition-colors"
            >
              <h3 className="text-[15px] font-bold text-black leading-6 line-clamp-2 mb-3 pr-8">
                {job.title}
              </h3>
              <dl className="space-y-1.5 text-[13px]">
                <div className="flex gap-2">
                  <dt className="w-12 shrink-0 text-gray-400">카테고리</dt>
                  <dd className="font-medium text-black">{CATEGORY_LABELS[job.category] ?? job.category}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-12 shrink-0 text-gray-400">지역</dt>
                  <dd className="font-medium text-black">{REGION_LABELS[job.region] ?? job.region}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="w-12 shrink-0 text-gray-400">저장일</dt>
                  <dd className="text-gray-500">{new Date(job.createdDate).toLocaleDateString("ko-KR")}</dd>
                </div>
              </dl>
            </Link>

            {/* 북마크 해제 버튼 */}
            <button
              type="button"
              onClick={() => handleRemove(job)}
              aria-label="북마크 해제"
              className="absolute top-3 right-3 text-[18px] leading-none text-red-400 hover:text-red-600 transition opacity-0 group-hover/card:opacity-100"
            >
              ♥
            </button>
          </li>
        ))}
      </ul>

      {/* Undo 토스트 */}
      {undoTarget && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-gray-900 px-5 py-3 text-white shadow-xl">
          <span className="text-[14px]">북마크가 해제되었습니다.</span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-[14px] font-bold text-yellow-300 underline underline-offset-2 hover:text-yellow-200"
          >
            실행 취소
          </button>
        </div>
      )}
    </div>
  );
}
