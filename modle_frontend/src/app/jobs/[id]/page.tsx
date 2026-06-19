"use client";

import { ClientProposalButton } from "@/components/message/ClientProposalButton";
import { ModelCard } from "@/components/model/ModelCard";
import { ReportModal } from "@/components/ui/ReportModal";
import { useAuth } from "@/hooks/useAuth";
import { checkApplyStatus, getApplicants } from "@/lib/api/application";
import { addJobBookmark, getJobBookmarks, removeJobBookmark } from "@/lib/api/bookmark";
import { API_BASE_URL, authenticatedFetch, client } from "@/lib/api/client";
import { STATUS_CHANGE_DESCRIPTIONS, STATUS_COLORS, STATUS_LABELS, STATUS_TRANSITION_LABELS, STATUS_TRANSITIONS, eulo } from "@/lib/constants/jobPostingStatus";
import { getRegionLabel } from "@/lib/constants/region";
import type { Model } from "@/types/model";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";

type ClientInfo = {
  clientProfileId?: number | null;
  clientCompanyName?: string | null;
  clientRegion?: string | null;
  clientAvgRating?: number;
  clientReviewCount?: number;
};

type ClientDetail = ClientInfo & {
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

type ModelDetail = ClientInfo & {
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

type OtherDetail = ClientInfo & {
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

type RecommendationCardItem = {
  rank: number;
  locked: boolean;
  modelId: number | null;
  userId: number | null;
  name: string | null;
  profileImageUrl: string | null;
  age: number | null;
  height: number | null;
  categories: string[];
  region: string | null;
  avgRating: number | null;
};

type RecommendationList = {
  postId: number;
  unlocked: boolean;
  reasonCode: string | null;
  items: RecommendationCardItem[];
};

type ApiEnvelope<T> = {
  resultCode?: string;
  msg?: string;
  data?: T;
};

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
  const [recommendations, setRecommendations] =
    useState<RecommendationList | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState("");
  const [unlockingRecommendations, setUnlockingRecommendations] =
    useState(false);
  const [applicantCount, setApplicantCount] = useState<number | null>(null);
  const [statusReasonModalOpen, setStatusReasonModalOpen] = useState(false);
  const [statusReason, setStatusReason] = useState("");

  const isOwner = Boolean(
    detail && isClientDetail(detail) && user?.id === detail.clientId,
  );

  const loadRecommendations = useCallback(async () => {
    setRecommendationLoading(true);
    setRecommendationError("");

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/jobs/${postingId}/recommendations`,
        { credentials: "include" },
      );
      const body = (await response.json().catch(() => null)) as
        | ApiEnvelope<RecommendationList>
        | null;

      if (!response.ok) {
        throw new Error(body?.msg || "추천 모델을 불러오지 못했습니다.");
      }

      setRecommendations(body?.data ?? null);
    } catch {
      setRecommendationError("추천 모델을 불러오지 못했습니다.");
    } finally {
      setRecommendationLoading(false);
    }
  }, [postingId]);

  const handleUnlockRecommendations = async () => {
    setUnlockingRecommendations(true);
    setRecommendationError("");

    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/api/v1/jobs/${postingId}/recommendations/unlock`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const body = (await response.json().catch(() => null)) as
        | ApiEnvelope<RecommendationList>
        | null;

      if (!response.ok) {
        throw new Error(body?.msg || "추천 모델 잠금 해제에 실패했습니다.");
      }

      setRecommendations(body?.data ?? null);
    } catch {
      setRecommendationError("추천 모델 잠금 해제에 실패했습니다.");
    } finally {
      setUnlockingRecommendations(false);
    }
  };

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

  useEffect(() => {
    if (!isOwner) return;
    const timerId = window.setTimeout(() => {
      void loadRecommendations();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [isOwner, loadRecommendations]);

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
      Promise.resolve().then(() => setHasApplied(false));
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
    if (!user) {
      requireLogin();
      return;
    }
    const was = favorited;
    setFavorited(!was);
    try {
      if (was) await removeJobBookmark(postingId);
      else await addJobBookmark(postingId);
    } catch {
      setFavorited(was);
    }
  };

  const submitStatusChange = async (status: string, reason?: string) => {
    setStatusChanging(true);
    const { data, response } = await client.PATCH("/api/v1/jobs/{id}/status", {
      params: { path: { id: postingId } },
      body: {
        status: status as
          | "RECRUITING"
          | "SHOOTING"
          | "COMPLETED"
          | "CANCELLED"
          | "ON_HOLD"
          | "CLOSED",
        reason: reason || null,
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

  const handleStatusChange = () => {
    if (!selectedStatus) return;
    setStatusReason("");
    setStatusReasonModalOpen(true);
  };

  const statusNeedsReason = selectedStatus !== "SHOOTING";

  const handleStatusReasonConfirm = async () => {
    if (statusNeedsReason && !statusReason.trim()) {
      alert("사유를 입력해 주세요.");
      return;
    }
    setStatusReasonModalOpen(false);
    await submitStatusChange(selectedStatus, statusReason.trim() || undefined);
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
          {statusReasonModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="w-full max-w-sm rounded-xl bg-surface p-6 shadow-xl">
                <h3 className="text-[16px] font-semibold text-ink">
                  {(() => {
                    const label = STATUS_TRANSITION_LABELS[selectedStatus] ?? STATUS_LABELS[selectedStatus] ?? selectedStatus;
                    return statusNeedsReason
                      ? `${label} 사유 입력`
                      : `${label}${eulo(label)} 변경`;
                  })()}
                </h3>
                {statusNeedsReason ? (
                  <textarea
                    className="mt-3 w-full resize-none rounded-lg border border-hairline bg-canvas px-3 py-2 text-[13px] text-ink placeholder:text-mute focus:border-primary focus:outline-none"
                    rows={4}
                    placeholder={`${STATUS_TRANSITION_LABELS[selectedStatus] ?? STATUS_LABELS[selectedStatus] ?? selectedStatus} 사유를 입력해 주세요.`}
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                  />
                ) : (
                  <p className="mt-3 text-[13px] leading-6 text-body">
                    공고 상태를{" "}
                    <span className="font-semibold text-ink">
                      {STATUS_LABELS[selectedStatus] ?? selectedStatus}
                    </span>
                    으로 변경하시겠습니까?
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatusReasonModalOpen(false)}
                    className="flex-1 rounded-lg border border-hairline bg-surface py-2 text-[13px] font-semibold text-body transition hover:border-hairline-strong"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleStatusReasonConfirm}
                    disabled={statusChanging}
                    className="flex-1 rounded-lg bg-primary py-2 text-[13px] font-semibold text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
                  >
                    {statusChanging ? "처리 중..." : "확인"}
                  </button>
                </div>
              </div>
            </div>
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
                <InfoRow label="촬영 지역" value={getRegionLabel(detail.region)} />
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

            {/* 의뢰인 정보 카드 */}
            {detail.clientProfileId ? (
              <section className="rounded-xl border border-hairline bg-surface p-6">
                <h2 className="text-[15px] font-semibold leading-6 text-ink">
                  의뢰인 정보
                </h2>
                <Link
                  href={`/clients/${detail.clientProfileId}`}
                  className="mt-4 flex items-center justify-between rounded-lg border border-hairline bg-canvas px-4 py-3 transition hover:border-hairline-strong hover:bg-canvas-soft"
                >
                  <div>
                    <p className="text-[14px] font-semibold text-ink">
                      {detail.clientCompanyName ?? "-"}
                    </p>
                    {detail.clientRegion ? (
                      <p className="mt-0.5 text-[12px] text-mute">
                        {getRegionLabel(detail.clientRegion)}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[12px] text-mute">
                      {(detail.clientReviewCount ?? 0) > 0
                        ? `★ ${(detail.clientAvgRating ?? 0).toFixed(1)} (${detail.clientReviewCount}건)`
                        : "리뷰 없음"}
                    </p>
                  </div>
                  <span className="text-[13px] text-mute">→</span>
                </Link>
              </section>
            ) : null}

            {/* CLIENT 뷰 본인 공고: 상태 변경 */}
            {isOwner && nextStatuses.length > 0 ? (
              <section className="rounded-xl border border-hairline bg-surface p-6">
                <h2 className="text-[15px] font-semibold leading-6 text-ink">
                  상태 변경
                </h2>
                <ul className="mt-3 space-y-2">
                  {nextStatuses.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => setSelectedStatus(s)}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                          selectedStatus === s
                            ? "border-primary bg-primary/5"
                            : "border-hairline bg-canvas hover:border-hairline-strong"
                        }`}
                      >
                        <p className={`text-[13px] font-semibold ${selectedStatus === s ? "text-primary" : "text-ink"}`}>
                          {STATUS_TRANSITION_LABELS[s] ?? STATUS_LABELS[s] ?? s}
                        </p>
                        <p className="mt-0.5 text-[11px] leading-4 text-mute">
                          {STATUS_CHANGE_DESCRIPTIONS[s] ?? ""}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={handleStatusChange}
                  disabled={statusChanging || !selectedStatus}
                  className="mt-3 w-full rounded-lg bg-primary py-2.5 text-[13px] font-semibold text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
                >
                  {(() => {
                    const label = STATUS_TRANSITION_LABELS[selectedStatus] ?? STATUS_LABELS[selectedStatus] ?? "상태 변경";
                    return statusChanging ? "변경 중..." : `${label}${eulo(label)} 변경`;
                  })()}
                </button>
              </section>
            ) : null}
          </aside>
        </div>

        {isOwner ? (
          <RecommendationSection
            recommendations={recommendations}
            loading={recommendationLoading}
            error={recommendationError}
            unlocking={unlockingRecommendations}
            onUnlock={handleUnlockRecommendations}
            onRetry={loadRecommendations}
          />
        ) : null}

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

function RecommendationSection({
  recommendations,
  loading,
  error,
  unlocking,
  onUnlock,
  onRetry,
}: {
  recommendations: RecommendationList | null;
  loading: boolean;
  error: string;
  unlocking: boolean;
  onUnlock: () => void;
  onRetry: () => void;
}) {
  const items = recommendations?.items ?? [];
  const displayItems = [...items].sort((a, b) => {
    const aWasInitiallyVisible = isInitiallyVisibleRank(items.length, a.rank);
    const bWasInitiallyVisible = isInitiallyVisibleRank(items.length, b.rank);

    if (aWasInitiallyVisible !== bWasInitiallyVisible) {
      return aWasInitiallyVisible ? -1 : 1;
    }

    return a.rank - b.rank;
  });
  const hasLockedItems = items.some((item) => item.locked);
  const emptyMessage =
    recommendations?.reasonCode && recommendations.reasonCode !== "NO_RESULT"
      ? recommendations.reasonCode
      : "추천 가능한 모델이 아직 없습니다.";

  return (
    <section className="rounded-2xl border border-hairline bg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-primary">
            AI MATCHING
          </p>
          <h2 className="mt-1 text-[20px] font-bold leading-7 text-ink">
            추천 모델
          </h2>
          <p className="mt-2 text-[13px] leading-5 text-mute">
            공고 조건과 포트폴리오 정보를 바탕으로 어울리는 모델을 먼저 보여드립니다.
          </p>
        </div>

        {hasLockedItems && !recommendations?.unlocked ? (
          <button
            type="button"
            onClick={onUnlock}
            disabled={unlocking}
            className="h-10 rounded-lg bg-ink px-5 text-[13px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {unlocking ? "확인 중..." : "추천 더 보기"}
          </button>
        ) : null}
      </div>

      {loading ? (
        <p className="mt-6 rounded-xl bg-canvas-soft px-4 py-6 text-center text-[13px] text-mute">
          추천 모델을 불러오는 중입니다.
        </p>
      ) : error ? (
        <div className="mt-6 rounded-xl border border-error/30 bg-red-50 px-4 py-4">
          <p className="text-[13px] text-error">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-lg border border-error/30 bg-white px-3 py-2 text-[12px] font-semibold text-error"
          >
            다시 불러오기
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 rounded-xl bg-canvas-soft px-4 py-6 text-center text-[13px] text-mute">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {displayItems.map((item) =>
            item.locked ? (
              <LockedRecommendationCard
                key={`locked-${item.rank}`}
                item={item}
                unlocking={unlocking}
                onUnlock={onUnlock}
              />
            ) : (
              <VisibleRecommendationCard
                key={item.modelId ?? `visible-${item.rank}`}
                item={item}
              />
            ),
          )}
        </div>
      )}
    </section>
  );
}

function VisibleRecommendationCard({ item }: { item: RecommendationCardItem }) {
  const model = toModel(item);

  return (
    <article className="flex h-full flex-col rounded-xl border border-hairline bg-white p-3 shadow-sm">
      <div className="flex flex-1 flex-col">
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
            추천 후보
          </span>
        </div>

        <Link href={`/models/${model.id}`} className="block flex-1">
          <ModelCard model={model} showFavoriteButton={false} />
        </Link>
      </div>

      {item.userId ? (
        <ClientProposalButton
          recipientUserId={item.userId}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-primary text-[13px] font-semibold text-on-primary transition hover:bg-primary-hover"
        />
      ) : null}
    </article>
  );
}

function LockedRecommendationCard({
  item,
  unlocking,
  onUnlock,
}: {
  item: RecommendationCardItem;
  unlocking: boolean;
  onUnlock: () => void;
}) {
  return (
    <article className="flex h-full min-h-[260px] flex-col rounded-xl border border-dashed border-hairline-strong bg-canvas-soft p-4">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-mute">
            추가 후보
          </span>
          <span className="text-[11px] font-semibold text-mute">더 보기</span>
        </div>

        <div className="mt-5 rounded-xl border border-hairline bg-white/70 p-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-200 blur-[1px]" />
          <p className="mt-4 text-center text-[13px] font-semibold text-ink">
            이런 모델은 어떠신가요?
          </p>
          <p className="mt-2 text-center text-[12px] leading-5 text-mute">
            조건에 맞는 다른 후보도 준비되어 있어요. 더 보기 후 상세 프로필을 확인할 수 있습니다.
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.categories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-hairline bg-white px-2 py-1 text-[10px] font-semibold text-mute"
            >
              {category}
            </span>
          ))}
          {item.region ? (
            <span className="rounded-full border border-hairline bg-white px-2 py-1 text-[10px] font-semibold text-mute">
              {item.region}
            </span>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onUnlock}
        disabled={unlocking}
        className="mt-5 h-10 rounded-lg bg-ink text-[13px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
      >
        {unlocking ? "확인 중..." : "후보 더 보기"}
      </button>
    </article>
  );
}

function isInitiallyVisibleRank(totalCount: number, rank: number) {
  if (totalCount <= 2) {
    return true;
  }

  return rank === 2 || rank === 3;
}

function toModel(item: RecommendationCardItem): Model {
  return {
    id: item.modelId ?? 0,
    userId: item.userId ?? 0,
    name: item.name || "이름 비공개",
    region: item.region || "지역 미상",
    rating: item.avgRating ?? 0,
    reviewCount: 0,
    profileImageUrl: item.profileImageUrl || "/placeholder.png",
    categories: item.categories,
    age: item.age ?? undefined,
    height: item.height ?? undefined,
  };
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-3">
      <dt className="text-mute">{label}</dt>
      <dd className="min-w-0 break-words text-ink">{value || "-"}</dd>
    </div>
  );
}
