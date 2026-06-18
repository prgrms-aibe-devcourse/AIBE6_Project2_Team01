"use client";

import { ReportModal } from "@/components/ui/ReportModal";
import { useAuth } from "@/hooks/useAuth";
import { checkApplyStatus, getApplicants } from "@/lib/api/application";
import {
  addJobBookmark,
  getJobBookmarks,
  removeJobBookmark,
} from "@/lib/api/bookmark";
import { client } from "@/lib/api/client";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  STATUS_TRANSITIONS,
} from "@/lib/constants/jobPostingStatus";
import { getRegionLabel } from "@/lib/constants/region";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

type ClientDetail = {
  id: number;
  clientId: number;
  title: string;
  content: string;
  category: string;
  region: string;
  status: string;
  requiredSex?: string;
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  weightMin?: number;
  weightMax?: number;
  minCareerMonths?: number;
  payment?: number;
  payType?: string;
  shootDate?: string;
  createdDate?: string;
  recommendedModelIds: number[];
};

type ModelDetail = {
  id: number;
  title: string;
  content: string;
  category: string;
  region: string;
  status: string;
  requiredSex?: string;
  ageMin?: number;
  ageMax?: number;
  heightMin?: number;
  heightMax?: number;
  weightMin?: number;
  weightMax?: number;
  minCareerMonths?: number;
  payment?: number;
  payType?: string;
  shootDate?: string;
  createdDate?: string;
  favorited: boolean;
};

type OtherDetail = {
  id: number;
  title: string;
  content: string;
  category: string;
  region: string;
  status: string;
  requiredSex?: string;
  payment?: number;
  payType?: string;
  shootDate?: string;
  createdDate?: string;
};

type DetailData = ClientDetail | ModelDetail | OtherDetail;

function isClientDetail(d: unknown): d is ClientDetail {
  return typeof d === "object" && d !== null && "clientId" in d;
}

function isModelDetail(d: unknown): d is ModelDetail {
  return typeof d === "object" && d !== null && "favorited" in d;
}

function isOtherDetail(d: DetailData): d is OtherDetail {
  return !isClientDetail(d) && !isModelDetail(d);
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const postingId = Number(id);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const requireLogin = () => {
    alert("로그인이 필요한 서비스입니다.");
    router.push("/login");
  };

  const [detail, setDetail] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorited, setFavorited] = useState(false);
  const [hasApplied, setHasApplied] = useState<boolean | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusChanging, setStatusChanging] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [applicantCount, setApplicantCount] = useState<number | null>(null);

  useEffect(() => {
    if (authLoading) return;
    client
      .GET("/api/v1/jobs/{id}", {
        params: { path: { id: postingId } },
      })
      .then(({ data, response }) => {
        if (!response.ok) {
          setError("공고를 불러오지 못했습니다.");
          setLoading(false);
          return;
        }
        const loaded = (data?.data as DetailData) ?? null;
        setDetail(loaded);
        if (loaded && isModelDetail(loaded)) {
          setFavorited(loaded.favorited); // 빠른 초기값 (API 재확인 전 표시용)
        }
        if (loaded && isClientDetail(loaded)) {
          const transitions = STATUS_TRANSITIONS[loaded.status] ?? [];
          setSelectedStatus(transitions[0] ?? "");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("공고를 불러오지 못했습니다.");
        setLoading(false);
      });
  }, [postingId, authLoading, user]);

  // 북마크 실제 상태를 API로 동기화 (목록과 상세 간 불일치 방지)
  useEffect(() => {
    if (!user || user.role !== "MODEL") return;
    getJobBookmarks()
      .then((bookmarks) => {
        setFavorited(bookmarks.some((b) => b.jobPostingId === postingId));
      })
      .catch(() => {});
  }, [user, postingId]);

  // 지원 여부 동기화 (비로그인·MODEL 외 역할은 false로 초기화해 버튼 활성화)
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "MODEL") {
      setHasApplied(false);
      return;
    }
    checkApplyStatus(postingId)
      .then(setHasApplied)
      .catch(() => setHasApplied(false));
  }, [user, postingId, authLoading]);

  // 공고 작성자일 때 지원자 수 조회
  useEffect(() => {
    if (!detail || !isClientDetail(detail)) return;
    if (!user || user.id !== detail.clientId) return;
    getApplicants(postingId)
      .then((list) => setApplicantCount(list.length))
      .catch(() => {});
  }, [detail, user, postingId]);

  const handleBookmarkToggle = async () => {
    const was = favorited;
    setFavorited(!was);
    try {
      if (was) await removeJobBookmark(postingId);
      else await addJobBookmark(postingId);
    } catch {
      setFavorited(was);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus) return;
    if (
      !window.confirm(
        `상태를 "${STATUS_LABELS[selectedStatus]}"(으)로 변경하시겠습니까?`,
      )
    )
      return;
    setStatusChanging(true);
    const { data, response } = await client.PATCH("/api/v1/jobs/{id}/status", {
      params: { path: { id: postingId } },
      body: {
        status: selectedStatus as
          | "RECRUITING"
          | "SHOOTING"
          | "COMPLETED"
          | "CANCELLED"
          | "ON_HOLD"
          | "CLOSED",
      },
    });
    setStatusChanging(false);
    if (!response.ok) {
      alert("상태 변경에 실패했습니다.");
      return;
    }
    const newStatus = (data?.data as { status: string })?.status;
    if (newStatus) {
      setDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
      const transitions = STATUS_TRANSITIONS[newStatus] ?? [];
      setSelectedStatus(transitions[0] ?? "");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("공고를 삭제하시겠습니까?")) return;
    const { response } = await client.DELETE("/api/v1/jobs/{id}", {
      params: { path: { id: postingId } },
    });
    if (!response.ok) {
      alert("삭제에 실패했습니다.");
      return;
    }
    router.push("/jobs");
  };

  if (authLoading) {
    return <main className="min-h-screen bg-canvas" />;
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-canvas">
        <p className="py-20 text-center text-[15px] text-mute">로딩 중...</p>
      </main>
    );
  }

  if (error || !detail) {
    return (
      <main className="min-h-screen bg-canvas">
        <p className="py-20 text-center text-[15px] text-error">
          {error || "공고를 찾을 수 없습니다."}
        </p>
      </main>
    );
  }

  const isOwner = isClientDetail(detail) && user?.id === detail.clientId;
  const hasRangeInfo = !isOtherDetail(detail);
  const nextStatuses = isOwner
    ? (STATUS_TRANSITIONS[(detail as ClientDetail).status] ?? [])
    : [];

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-hairline pb-6">
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-[28px] font-bold leading-9 text-ink">
                  {detail.title}
                </h1>
                <span
                  className={`inline-flex h-7 items-center rounded-full px-3 text-[12px] font-semibold ${STATUS_COLORS[detail.status] ?? "bg-canvas-soft text-body"}`}
                >
                  {STATUS_LABELS[detail.status] ?? detail.status}
                </span>
              </div>
              <p className="mt-1 text-[13px] text-mute">
                등록일:{" "}
                {detail.createdDate ? detail.createdDate.substring(0, 10) : "-"}
              </p>
            </div>
            {isOwner ? (
              <div className="flex gap-3">
                <Link
                  href={`/jobs/${detail.id}/edit`}
                  className="inline-flex h-10 items-center rounded-lg border border-hairline bg-surface px-5 text-[14px] font-semibold text-ink transition hover:border-hairline-strong"
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="h-10 rounded-lg bg-error px-5 text-[14px] font-semibold text-on-primary transition hover:opacity-90"
                >
                  삭제
                </button>
              </div>
            ) : !user || isModelDetail(detail) ? (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBookmarkToggle}
                  className={`h-10 rounded-lg border px-5 text-[14px] font-semibold transition ${
                    favorited
                      ? "border-red-400 bg-red-50 text-red-500"
                      : "border-hairline bg-surface text-body hover:border-hairline-strong"
                  }`}
                >
                  {favorited ? "♥ 저장하기" : "♡ 저장하기"}
                </button>
                <div className="group relative">
                  <button
                    type="button"
                    disabled={hasApplied === true || hasApplied === null}
                    onClick={() => {
                      if (!user) {
                        requireLogin();
                        return;
                      }
                      router.push(`/application/${postingId}`);
                    }}
                    className="h-10 rounded-lg bg-primary px-6 text-[14px] font-semibold text-on-primary transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {hasApplied === true ? "지원함" : "지원하기"}
                  </button>
                  {hasApplied === null && (
                    <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[12px] text-on-primary group-hover:block">
                      지원 상태를 확인할 수 없습니다
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  className="h-10 rounded-lg border border-hairline bg-surface px-4 text-[14px] font-semibold text-mute transition hover:border-red-300 hover:text-red-500"
                >
                  신고
                </button>
              </div>
            ) : null}
          </div>
          {reportOpen && (
            <ReportModal
              targetType="JOB_POSTING"
              targetId={postingId}
              onClose={() => setReportOpen(false)}
            />
          )}
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* 공고 본문 */}
          <section className="rounded-xl border border-hairline bg-surface p-6">
            <h2 className="text-lg font-semibold leading-[26px] text-ink">
              공고 내용
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-body">
              {detail.content}
            </p>
          </section>

          {/* 우측 정보 패널 */}
          <aside className="flex flex-col gap-6">
            <section className="rounded-xl border border-hairline bg-surface p-6">
              <h2 className="text-[15px] font-semibold leading-6 text-ink">
                공고 정보
              </h2>
              <dl className="mt-4 space-y-3 text-[13px] leading-5">
                <InfoRow label="카테고리" value={detail.category} />
                <InfoRow label="지역" value={getRegionLabel(detail.region)} />
                <InfoRow
                  label="성별 조건"
                  value={
                    detail.requiredSex === "M"
                      ? "남성"
                      : detail.requiredSex === "F"
                        ? "여성"
                        : "무관"
                  }
                />
                <InfoRow
                  label="보수"
                  value={
                    detail.payType === "FREE"
                      ? "무료"
                      : detail.payType === "SERVICE"
                        ? "서비스 제공"
                        : detail.payment != null
                          ? `${Number(detail.payment).toLocaleString("ko-KR")}원`
                          : "-"
                  }
                />
                {detail.shootDate ? (
                  <InfoRow
                    label="촬영일"
                    value={detail.shootDate.substring(0, 10)}
                  />
                ) : null}
                {hasRangeInfo ? (
                  <>
                    {(detail as ModelDetail).ageMin != null ||
                    (detail as ModelDetail).ageMax != null ? (
                      <InfoRow
                        label="나이"
                        value={`${(detail as ModelDetail).ageMin ?? "-"} ~ ${(detail as ModelDetail).ageMax ?? "-"}세`}
                      />
                    ) : null}
                    {(detail as ModelDetail).heightMin != null ||
                    (detail as ModelDetail).heightMax != null ? (
                      <InfoRow
                        label="키"
                        value={`${(detail as ModelDetail).heightMin ?? "-"} ~ ${(detail as ModelDetail).heightMax ?? "-"}cm`}
                      />
                    ) : null}
                    {(detail as ModelDetail).weightMin != null ||
                    (detail as ModelDetail).weightMax != null ? (
                      <InfoRow
                        label="몸무게"
                        value={`${(detail as ModelDetail).weightMin ?? "-"} ~ ${(detail as ModelDetail).weightMax ?? "-"}kg`}
                      />
                    ) : null}
                    {(detail as ModelDetail).minCareerMonths != null ? (
                      <InfoRow
                        label="최소 경력"
                        value={`${(detail as ModelDetail).minCareerMonths}개월`}
                      />
                    ) : null}
                  </>
                ) : null}
              </dl>
            </section>

            {/* CLIENT 뷰 본인 공고: 상태 변경 */}
            {isOwner && nextStatuses.length > 0 ? (
              <section className="rounded-xl border border-hairline bg-surface p-6">
                <h2 className="text-[15px] font-semibold leading-6 text-ink">
                  상태 변경
                </h2>
                <div className="mt-4 flex gap-2">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="flex-1 rounded-lg border border-hairline bg-canvas px-3 py-2 text-[13px] text-ink focus:border-primary focus:outline-none"
                  >
                    {nextStatuses.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleStatusChange}
                    disabled={statusChanging}
                    className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
                  >
                    {statusChanging ? "변경 중..." : "변경"}
                  </button>
                </div>
              </section>
            ) : null}

            {/* CLIENT 뷰 본인 공고: AI 추천 모델 */}
            {isOwner ? (
              <section className="rounded-xl border border-hairline bg-surface p-6">
                <h2 className="text-[15px] font-semibold leading-6 text-ink">
                  AI 추천 모델
                </h2>
                {(detail as ClientDetail).recommendedModelIds.length === 0 ? (
                  <p className="mt-3 text-[13px] text-mute">추천 없음</p>
                ) : (
                  <ul className="mt-3 space-y-1">
                    {(detail as ClientDetail).recommendedModelIds.map((mid) => (
                      <li key={mid} className="text-[13px] text-ink">
                        모델 ID: {mid}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}
          </aside>
        </div>

        <div className="pt-4 flex flex-wrap items-center gap-4">
          <Link
            href="/jobs"
            className="text-[14px] text-mute underline-offset-2 hover:underline"
          >
            ← 목록으로
          </Link>
          {isOwner && (
            <Link
              href={`/jobs/${detail.id}/applicants`}
              className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-[14px] font-semibold text-on-primary transition hover:bg-primary-hover"
            >
              지원자 목록 보기
              {applicantCount !== null ? ` (${applicantCount}명)` : ""}
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3">
      <dt className="text-mute">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{value || "-"}</dd>
    </div>
  );
}
