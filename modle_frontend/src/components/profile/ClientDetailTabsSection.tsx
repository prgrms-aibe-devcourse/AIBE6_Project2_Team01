"use client";

import { useEffect, useState } from "react";
import { ReviewList } from "@/components/review/ReviewList";
import { getClientJobPostings, ClientJobPosting } from "@/lib/api/clientProfile";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants/jobPostingStatus";
import { getCategoryLabel } from "@/lib/constants/category";
import { getRegionLabel } from "@/lib/constants/region";

interface Props {
  clientId: number;
  clientUserId: number;
  reviewCount: number;
  introduction: string;
}

type Tab = "intro" | "review" | "jobs";

// 공개 노출 상태만 필터로 제공 (취소·보류 제외)
const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "전체" },
  { value: "RECRUITING", label: "모집 중" },
  { value: "SHOOTING", label: "촬영 중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CLOSED", label: "마감" },
];

export function ClientDetailTabsSection({ clientId, clientUserId, reviewCount, introduction }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("intro");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [jobs, setJobs] = useState<ClientJobPosting[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsLoaded, setJobsLoaded] = useState(false);

  useEffect(() => {
    // 탭 활성화 여부와 무관하게 마운트 시 한 번 조회해, 비활성 상태에서도 탭 개수를 표시한다.
    let cancelled = false;
    setJobsLoading(true);
    setJobsError(null);

    // 공개 공고 전체를 한 번만 받아오고, 상태 필터링·개수 집계는 클라이언트에서 처리한다.
    getClientJobPostings(clientId)
      .then((data) => {
        if (!cancelled) {
          setJobs(data);
          setJobsLoaded(true);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setJobsError(err instanceof Error ? err.message : "공고 목록을 불러오는데 실패했습니다.");
        }
      })
      .finally(() => {
        if (!cancelled) setJobsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  function tabClass(tab: Tab) {
    return `flex-1 cursor-pointer py-4 text-center transition-colors border-b-[3px] ${
      activeTab === tab
        ? "border-black font-bold text-black"
        : "border-transparent font-medium text-gray-400 hover:text-black"
    }`;
  }

  function filterClass(value: string) {
    return `cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
      statusFilter === value
        ? "border-black bg-black text-white"
        : "border-gray-300 text-gray-600 hover:border-black hover:text-black"
    }`;
  }

  // 선택한 상태 필터로 좁힌 목록 (빈 값이면 전체)
  const visibleJobs = statusFilter
    ? jobs.filter((j) => j.status === statusFilter)
    : jobs;

  // 필터 버튼/탭에 표시할 상태별 개수 (빈 값이면 공개 공고 전체)
  function statusCount(value: string) {
    return value ? jobs.filter((j) => j.status === value).length : jobs.length;
  }

  return (
    <div className="mt-20 md:mt-24">
      <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-white">
        <button onClick={() => setActiveTab("intro")} className={tabClass("intro")}>
          기업 소개
        </button>
        <button onClick={() => setActiveTab("review")} className={tabClass("review")}>
          리뷰 ({reviewCount})
        </button>
        <button onClick={() => setActiveTab("jobs")} className={tabClass("jobs")}>
          작성한 공고{jobsLoaded ? ` (${visibleJobs.length})` : ""}
        </button>
      </div>

      <div className="mx-auto max-w-[800px] pb-20 pt-10">
        {activeTab === "intro" && (
          <div className="border border-gray-100 bg-gray-50 p-8 text-sm font-medium leading-loose text-gray-800 whitespace-pre-wrap md:text-base">
            {introduction || "작성된 기업 소개글이 없습니다."}
          </div>
        )}
        {activeTab === "review" && (
          <ReviewList targetUserId={clientUserId} totalCount={reviewCount} />
        )}
        {activeTab === "jobs" && (
          <div>
            {/* 상태 필터 */}
            <div className="mb-6 flex flex-wrap gap-2">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.value || "all"}
                  onClick={() => setStatusFilter(f.value)}
                  className={filterClass(f.value)}
                >
                  {f.label}{jobsLoaded ? ` (${statusCount(f.value)})` : ""}
                </button>
              ))}
            </div>

            {jobsLoading ? (
              <div className="py-16 text-center text-sm text-gray-400">불러오는 중…</div>
            ) : jobsError ? (
              <div className="py-16 text-center text-sm text-red-500">{jobsError}</div>
            ) : visibleJobs.length === 0 ? (
              <div className="py-16 text-center text-sm text-gray-400">작성한 공고가 없습니다.</div>
            ) : (
              <ul className="flex flex-col gap-3">
                {visibleJobs.map((job) => (
                  <li key={job.jobPostingId}>
                    <a
                      href={`/jobs/${job.jobPostingId}`}
                      className="flex items-center justify-between gap-4 border border-gray-100 bg-white p-5 transition-colors hover:border-black"
                    >
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                              STATUS_COLORS[job.status ?? ""] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {STATUS_LABELS[job.status ?? ""] ?? job.status}
                          </span>
                          <span className="text-xs text-gray-400">
                            {job.createdDate ? new Date(job.createdDate).toLocaleDateString() : ""}
                          </span>
                        </div>
                        <p className="truncate font-bold text-black">{job.title}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {getCategoryLabel(job.category)} · {getRegionLabel(job.region)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right text-sm text-gray-500">
                        지원자 <span className="font-bold text-black">{job.applicantCount ?? 0}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
