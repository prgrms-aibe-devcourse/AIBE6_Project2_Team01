"use client";

import { useAuth } from "@/hooks/useAuth";
import { client } from "@/lib/api/client";
import { applyToJob } from "@/lib/api/application";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { getRegionLabel } from "@/lib/constants/region";
import { getCategoryLabel } from "@/lib/constants/category";

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
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setToast({ type: "error", message: "로그인이 필요한 서비스입니다." });
      setTimeout(() => router.push("/login"), 1000);
      return;
    }
    if (user.role !== "MODEL") {
      setToast({ type: "error", message: "모델 계정만 지원할 수 있습니다." });
      setTimeout(() => router.push(`/jobs/${jobPostingId}`), 1000);
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
        setToast({ type: "error", message: "모집 중인 공고에만 지원할 수 있습니다." });
        setTimeout(() => router.push(`/jobs/${jobPostingId}`), 1000);
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
      setToast({ type: "success", message: "지원이 완료되었습니다." });
      setTimeout(() => router.push(`/jobs/${jobPostingId}`), 1000);
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
    <main className="min-h-screen bg-[#F8F9FA] text-black py-16">
      <div className="mx-auto flex w-full max-w-[700px] flex-col gap-8 px-6 py-12 md:px-12 bg-white border border-hairline shadow-xl rounded-[2.5rem]">
        <div className="text-center border-b-2 border-black pb-6 mb-4">
          <h1 className="text-3xl font-black text-black uppercase tracking-tighter">지원하기</h1>
          <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">멋진 기회가 여러분을 기다리고 있습니다</p>
        </div>

        {/* 지원자 정보 */}
        <section className="rounded-3xl border border-hairline shadow-sm bg-gray-50 p-6">
          <h2 className="mb-3 text-[15px] font-black uppercase tracking-widest text-black">지원자</h2>
          <p className="text-[15px] text-gray-800 font-medium">{modelName ?? "-"}</p>
        </section>

        {/* 공고 정보 */}
        <section className="rounded-3xl border border-hairline shadow-sm bg-gray-50 p-6">
          <h2 className="mb-4 text-[15px] font-black uppercase tracking-widest text-black">공고 정보</h2>
          <dl className="space-y-3 text-[14px]">
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <dt className="text-gray-500 font-bold">제목</dt>
              <dd className="text-black font-medium">{job?.title}</dd>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <dt className="text-gray-500 font-bold">카테고리</dt>
              <dd className="text-black font-medium">{getCategoryLabel(job?.category)}</dd>
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-3">
              <dt className="text-gray-500 font-bold">지역</dt>
              <dd className="text-black font-medium">{getRegionLabel(job?.region)}</dd>
            </div>
          </dl>
        </section>

        {/* 지원 메시지 폼 */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
          <div className="flex flex-col gap-3">
            <label
              htmlFor="coverLetter"
              className="text-[15px] font-black uppercase tracking-widest text-black"
            >
              지원 메시지
            </label>
            <textarea
              id="coverLetter"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={8}
              placeholder="지원 동기와 어필 사항을 자유롭게 작성해주세요."
              className="w-full resize-none rounded-2xl border border-gray-300 bg-white px-5 py-4 text-[15px] text-black font-medium placeholder-gray-400 focus:border-black focus:ring-2 focus:ring-black outline-none transition-all shadow-sm"
            />
          </div>

          {error && <p className="text-[13px] text-error">{error}</p>}

          <div className="flex gap-4 pt-4 border-t border-hairline mt-4">
            <button
              type="button"
              onClick={() => router.push(`/jobs/${jobPostingId}`)}
              className="h-14 px-8 rounded-full border border-gray-300 bg-white text-[13px] font-black tracking-widest uppercase text-black transition-all hover:bg-gray-50 shadow-sm"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-14 flex-1 rounded-full bg-black text-[13px] font-black tracking-widest uppercase text-white transition-all hover:bg-gray-900 shadow-md hover:-translate-y-0.5 disabled:opacity-50"
            >
              {submitting ? "지원 중..." : "지원하기"}
            </button>
          </div>
        </form>
      </div>
      {toast && <Toast toast={toast} />}
    </main>
  );
}
