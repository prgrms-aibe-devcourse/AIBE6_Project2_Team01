"use client";

import { useAuth } from "@/hooks/useAuth";
import { client } from "@/lib/api/client";
import type { components } from "@/lib/api/schema";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const REGION_OPTIONS = [
  { value: "", label: "전체 지역" },
  { value: "SEOUL", label: "서울" },
  { value: "BUSAN", label: "부산" },
  { value: "DAEGU", label: "대구" },
  { value: "INCHEON", label: "인천" },
  { value: "GWANGJU", label: "광주" },
  { value: "DAEJEON", label: "대전" },
  { value: "ULSAN", label: "울산" },
  { value: "SEJONG", label: "세종" },
  { value: "GYEONGGI", label: "경기" },
  { value: "GANGWON", label: "강원" },
  { value: "CHUNGBUK", label: "충북" },
  { value: "CHUNGNAM", label: "충남" },
  { value: "JEONBUK", label: "전북" },
  { value: "JEONNAM", label: "전남" },
  { value: "GYEONGBUK", label: "경북" },
  { value: "GYEONGNAM", label: "경남" },
  { value: "JEJU", label: "제주" },
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

  const toggleFavorite = (id: number) => {
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    let cancelled = false;

    client
      .GET("/api/v1/jobs", {
        params: {
          query: {
            region: region || undefined,
            category: category || undefined,
            pageable: {
              page,
              size: 10,
            } as any,
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
        <header className="border-b border-hairline pb-6">
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-[28px] font-bold leading-9 text-ink">
                공고 목록
              </h1>
              <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-body">
                지역·카테고리 필터로 원하는 공고를 찾아보세요.
              </p>
            </div>
            {isClient ? (
              <Link
                href="/jobs/new"
                className="inline-flex h-11 w-fit items-center rounded-lg bg-primary px-6 text-[15px] font-semibold text-on-primary transition hover:bg-primary-hover"
              >
                공고 등록
              </Link>
            ) : null}
          </div>
        </header>

        {/* 필터 */}
        <section className="flex flex-wrap items-center gap-2">
          <select
            value={region}
            onChange={(e) => handleFilterChange(e.target.value, category)}
            className="h-10 rounded-md border border-hairline bg-surface px-3 text-[14px] text-ink outline-none transition focus:border-ink"
          >
            {REGION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {CATEGORY_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => handleFilterChange(region, o.value)}
              className={`rounded-full border px-4 py-2 text-[13px] font-semibold leading-5 transition ${
                category === o.value
                  ? "border-primary bg-primary text-on-primary"
                  : "border-hairline bg-surface text-body hover:border-hairline-strong"
              }`}
            >
              {o.label}
            </button>
          ))}
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
              <li key={job.id} className="relative">
                <Link
                  href={`/jobs/${job.id}`}
                  className="block rounded-xl border border-hairline bg-surface p-5 transition hover:border-hairline-strong"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="line-clamp-2 text-[15px] font-semibold leading-6 text-ink">
                      {job.title}
                    </h2>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLORS[job.status ?? ""] ?? "bg-canvas-soft text-body"}`}>
                      {STATUS_LABELS[job.status ?? ""] ?? job.status}
                    </span>
                  </div>
                  <dl className="mt-3 space-y-1.5 text-[13px] leading-5">
                    <div className="flex gap-2">
                      <dt className="text-mute">카테고리</dt>
                      <dd className="text-ink">{job.category}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-mute">지역</dt>
                      <dd className="text-ink">{job.region}</dd>
                    </div>
                    <div className="flex gap-2">
                      <dt className="text-mute">보수</dt>
                      <dd className="text-ink">
                        {job.payType === "FREE"
                          ? "무료"
                          : job.payType === "SERVICE"
                            ? "서비스"
                            : job.payment != null
                              ? `${Number(job.payment).toLocaleString("ko-KR")}원`
                              : "-"}
                      </dd>
                    </div>
                    {job.shootDate ? (
                      <div className="flex gap-2">
                        <dt className="text-mute">촬영일</dt>
                        <dd className="text-ink">
                          {job.shootDate.substring(0, 10)}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </Link>
                {isModel ? (
                  <button
                    type="button"
                    onClick={() => toggleFavorite(job.id!)}
                    className="absolute right-3 bottom-3 text-[18px] leading-none transition hover:scale-110"
                    style={{ color: favoritedIds.has(job.id!) ? "#ef4444" : "#d1d5db" }}
                    aria-label={favoritedIds.has(job.id!) ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                  >
                    {favoritedIds.has(job.id!) ? "♥" : "♡"}
                  </button>
                ) : null}
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
