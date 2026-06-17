"use client";

import { useAuth } from "@/hooks/useAuth";
import { client } from "@/lib/api/client";
import { applyToJob } from "@/lib/api/application";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

type JobSummary = {
  id: number;
  title: string;
  category: string;
  region: string;
  status: string;
};

export default function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const jobPostingId = Number(id);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [job, setJob] = useState<JobSummary | null>(null);
  const [modelName, setModelName] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      alert("로그인이 필요한 서비스입니다.");
      router.push("/login");
      return;
    }
    if (user.role !== "MODEL") {
      alert("모델 계정만 지원할 수 있습니다.");
      router.push(`/jobs/${jobPostingId}`);
      return;
    }

    Promise.all([
      client.GET("/api/v1/jobs/{id}", { params: { path: { id: jobPostingId } } }),
      client.GET("/api/v1/models/my"),
    ]).then(([jobRes, modelRes]) => {
      if (!jobRes.response.ok) {
        setError("공고를 불러오지 못했습니다.");
        return;
      }
      const loaded = jobRes.data?.data as JobSummary;
      if (loaded.status !== "RECRUITING") {
        alert("모집 중인 공고에만 지원할 수 있습니다.");
        router.push(`/jobs/${jobPostingId}`);
        return;
      }
      setJob(loaded);

      if (modelRes.response.ok) {
        const me = modelRes.data?.data as { name?: string };
        setModelName(me?.name ?? null);
      }
    }).catch(() => setError("공고를 불러오지 못했습니다."));
  }, [jobPostingId, authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await applyToJob(jobPostingId, coverLetter.trim());
      alert("지원이 완료되었습니다.");
      router.push(`/jobs/${jobPostingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "지원에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (!job && !error)) {
    return (
      <main className="min-h-screen bg-canvas">
        <p className="py-20 text-center text-[15px] text-mute">로딩 중...</p>
      </main>
    );
  }

  if (error && !job) {
    return (
      <main className="min-h-screen bg-canvas">
        <p className="py-20 text-center text-[15px] text-error">{error}</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 px-4 py-10 sm:px-6">
        <h1 className="text-[24px] font-bold text-ink">지원하기</h1>

        {/* 지원자 정보 */}
        <section className="rounded-xl border border-hairline bg-surface p-6">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">지원자</h2>
          <p className="text-[14px] text-body">{modelName ?? "-"}</p>
        </section>

        {/* 공고 정보 */}
        <section className="rounded-xl border border-hairline bg-surface p-6">
          <h2 className="mb-3 text-[15px] font-semibold text-ink">공고 정보</h2>
          <dl className="space-y-2 text-[13px]">
            <div className="grid grid-cols-[72px_1fr] gap-2">
              <dt className="text-mute">제목</dt>
              <dd className="text-ink">{job?.title}</dd>
            </div>
            <div className="grid grid-cols-[72px_1fr] gap-2">
              <dt className="text-mute">카테고리</dt>
              <dd className="text-ink">{job?.category}</dd>
            </div>
            <div className="grid grid-cols-[72px_1fr] gap-2">
              <dt className="text-mute">지역</dt>
              <dd className="text-ink">{job?.region}</dd>
            </div>
          </dl>
        </section>

        {/* 지원 메시지 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="coverLetter"
              className="text-[14px] font-semibold text-ink"
            >
              지원 메시지
            </label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={8}
              placeholder="지원 동기와 어필 사항을 자유롭게 작성해주세요."
              className="w-full resize-none rounded-lg border border-hairline bg-canvas px-4 py-3 text-[14px] text-ink placeholder:text-mute focus:border-primary focus:outline-none"
            />
          </div>

          {error && <p className="text-[13px] text-error">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push(`/jobs/${jobPostingId}`)}
              className="h-11 flex-1 rounded-lg border border-hairline bg-surface text-[14px] font-semibold text-ink transition hover:border-hairline-strong"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 flex-1 rounded-lg bg-primary text-[14px] font-semibold text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
            >
              {submitting ? "지원 중..." : "지원하기"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
