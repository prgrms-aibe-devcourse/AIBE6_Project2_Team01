"use client";

import { useAuth } from "@/hooks/useAuth";
import { client } from "@/lib/api/client";
import { REGION_OPTIONS, getRegionLabel } from "@/lib/constants/region";
import type { components } from "@/lib/api/schema";
import {
  addJobBookmark,
  getJobBookmarks,
  removeJobBookmark,
} from "@/lib/api/bookmark";
import Link from "next/link";
import { useEffect, useState } from "react";
import { JobCard } from "@/components/jobposting/JobCard";

type JobListItem = components["schemas"]["JobPostingListResponse"];
type PageData = components["schemas"]["PageJobPostingListResponse"];

const CATEGORY_OPTIONS = [
  { value: "", label: "전체 카테고리" },
  { value: "HAIR", label: "헤어" },
  { value: "MAKEUP", label: "메이크업" },
  { value: "CLOTHING", label: "의류" },
  { value: "FITTING", label: "피팅" },
  { value: "HAND", label: "핸드" },
  { value: "FOOD", label: "음식" },
  { value: "PRODUCT", label: "제품" },
  { value: "ETC", label: "기타" },
];



const STATUS_LABELS: Record<string, string> = {
  RECRUITING: "모집 중",
  SHOOTING: "촬영 중",
  COMPLETED: "완료",
  CANCELLED: "취소",
  ON_HOLD: "일시정지",
  CLOSED: "마감",
};

const STATUS_COLORS: Record<string, string> = {
  RECRUITING: "bg-green-100 text-green-700",
  SHOOTING:   "bg-blue-100 text-blue-700",
  COMPLETED:  "bg-gray-100 text-gray-600",
  CANCELLED:  "bg-red-100 text-red-600",
  ON_HOLD:    "bg-amber-100 text-amber-700",
  CLOSED:     "bg-slate-200 text-slate-600",
};

export default function JobsPage() {
  const { user } = useAuth();
  const isModel = user?.role === "MODEL";
  const isClient = user?.role === "CLIENT";
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(0);
  const [pageData, setPageData] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());

  // 초기 북마크 목록 로드
  useEffect(() => {
    if (!isModel) return;
    getJobBookmarks()
      .then((bookmarks) => {
        setFavoritedIds(new Set(bookmarks.map((b) => b.jobPostingId)));
      })
      .catch(() => {});
  }, [isModel]);

  const toggleFavorite = async (id: number) => {
    const wasBookmarked = favoritedIds.has(id);
    // 낙관적 업데이트
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (wasBookmarked) await removeJobBookmark(id);
      else await addJobBookmark(id);
    } catch {
      // 실패 시 롤백
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  useEffect(() => {
    let cancelled = false;

    client
      .GET("/api/v1/jobs", {
        params: {
          query: {
            region: region || undefined,
            category: category || undefined,
            page,
            size: 10,
          },
        },
      })
      .then(({ data }) => {
        if (!cancelled) {
          setPageData(data?.data ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [region, category, page]);

  const handleFilterChange = (nextRegion: string, nextCategory: string) => {
    setLoading(true);
    setPage(0);
    setRegion(nextRegion);
    setCategory(nextCategory);
  };

  const handlePageChange = (i: number) => {
    setLoading(true);
    setPage(i);
  };

  const items = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 1;
  const currentPage = pageData?.number ?? 0;

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] bg-ink px-10 py-16 text-canvas shadow-xl mb-6">
          {/* Background image with opacity */}
          <div className="absolute inset-0">
            <img src="/images/jobs_banner.png" alt="Studio Background" className="w-full h-full object-cover opacity-20 mix-blend-luminosity" />
          </div>
          {/* Abstract background graphics */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>
          
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-bold tracking-wider text-gray-300">
                MODEL JOBS
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                공고 목록
              </h1>
              <p className="mt-4 max-w-[500px] text-[16px] leading-relaxed text-gray-400 font-medium">
                지역·카테고리 필터로 원하는 공고를 빠르고 정확하게 찾아보세요.
              </p>
            </div>
            {isClient ? (
              <Link
                href="/jobs/new"
                className="inline-flex h-14 items-center rounded-full bg-white px-8 text-[16px] font-bold text-ink transition-transform hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.15)]"
              >
                + 새로운 공고 등록
              </Link>
            ) : null}
          </div>
        </header>

        {/* 세련된 필터 영역 (Segmented Control 스타일) */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-2xl border border-hairline shadow-sm mb-4">
          <div className="flex w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-1">
            {CATEGORY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => handleFilterChange(region, o.value)}
                className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-[14px] font-bold transition-all ${
                  category === o.value
                    ? "bg-ink text-canvas shadow-md"
                    : "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-ink"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          
          <div className="w-full md:w-auto flex shrink-0 border-t md:border-t-0 md:border-l border-hairline pt-4 md:pt-0 md:pl-4 mt-2 md:mt-0">
            <select
              value={region}
              onChange={(e) => handleFilterChange(e.target.value, category)}
              className="w-full md:w-48 h-11 rounded-xl border border-hairline bg-gray-50 px-4 text-[14px] font-medium text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/10 cursor-pointer appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg stroke='currentColor' fill='none' stroke-width='2' viewBox='0 0 24 24' stroke-linecap='round' stroke-linejoin='round' height='1em' width='1em' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "1em" }}
            >
              <option value="">🗺️ 전체 지역</option>
              {REGION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* 목록 */}
        {loading ? (
          <p className="py-12 text-center text-[15px] text-mute">로딩 중...</p>
        ) : items.length === 0 ? (
          <p className="py-12 text-center text-[15px] text-mute">
            등록된 공고가 없습니다.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((job: JobListItem) => (
              <li key={job.id} className="relative h-full">
                <JobCard 
                  job={job} 
                  isFavorited={favoritedIds.has(job.id!)}
                  onToggleFavorite={isModel ? (e, id) => {
                    e.preventDefault();
                    toggleFavorite(id);
                  } : undefined}
                />
              </li>
            ))}
          </ul>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 ? (
          <nav className="flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handlePageChange(i)}
                className={`h-9 w-9 rounded-md border text-[13px] font-semibold transition ${
                  i === currentPage
                    ? "border-primary bg-primary text-on-primary"
                    : "border-hairline bg-surface text-body hover:border-hairline-strong"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        ) : null}
      </div>
    </main>
  );
}
