"use client";

import { useEffect, useState } from "react";

import { HandleReportModal } from "@/components/admin/HandleReportModal";
import { RejectReasonModal } from "@/components/admin/RejectReasonModal";
import { Toast, type ToastState } from "@/components/ui/Toast";
import {
  approveClient,
  getAdminReports,
  getPendingClients,
  handleAdminReport,
  rejectClient,
  type AdminReportStatus,
  type AdminReportTargetType,
  type PendingClient,
  type ReportItem,
} from "@/lib/api/admin";

// ─── 상수 ────────────────────────────────────────────────────────
const CLIENT_TYPE_LABEL: Record<string, string> = {
  INDIVIDUAL: "개인",
  ORGANIZATION: "법인",
};

const TARGET_TYPE_LABELS: Record<AdminReportTargetType, string> = {
  JOB_POSTING: "공고",
  PROFILE: "프로필",
  MESSAGE: "쪽지",
};

const REASON_LABELS: Record<string, string> = {
  SPAM: "스팸",
  INAPPROPRIATE: "부적절한 콘텐츠",
  FRAUD: "사기",
  HARASSMENT: "괴롭힘",
  OTHER: "기타",
};

const STATUS_LABELS: Record<AdminReportStatus, string> = {
  PENDING: "대기",
  ACTIONED: "처리완료",
  DISMISSED: "거절",
};

const STATUS_COLORS: Record<AdminReportStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACTIONED: "bg-green-100 text-green-700",
  DISMISSED: "bg-gray-100 text-gray-500",
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

// ─── 루트 페이지 ─────────────────────────────────────────────────
type Tab = "clients" | "reports";

const TABS: { key: Tab; label: string }[] = [
  { key: "clients", label: "의뢰인 승인" },
  { key: "reports", label: "신고 관리" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("clients");
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-display-lg text-ink">관리자 대시보드</h1>
        <p className="text-body-lg text-body mt-1">플랫폼 의뢰인 승인 및 신고 처리를 관리합니다.</p>
      </header>

      {/* 탭 바 */}
      <div className="flex gap-0 border-b border-hairline mb-8">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`px-6 py-3 text-[14px] font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-mute hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "clients" ? (
        <ClientsTab setToast={setToast} />
      ) : (
        <ReportsTab setToast={setToast} />
      )}

      {toast && <Toast toast={toast} />}
    </main>
  );
}

// ─── 의뢰인 승인 탭 ──────────────────────────────────────────────
function ClientsTab({ setToast }: { setToast: (t: ToastState) => void }) {
  const [clients, setClients] = useState<PendingClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingClient | null>(null);

  useEffect(() => {
    let active = true;
    getPendingClients()
      .then((data) => { if (active) setClients(data); })
      .catch((error: unknown) => {
        if (!active) return;
        setToast({
          type: "error",
          message: error instanceof Error ? error.message : "승인 대기 목록을 불러오는데 실패했습니다.",
        });
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [setToast]);

  const handleApprove = async (userId: number) => {
    setProcessingId(userId);
    try {
      await approveClient(userId);
      setClients((prev) => prev.filter((c) => c.userId !== userId));
      setToast({ type: "success", message: "승인되었습니다." });
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "승인에 실패했습니다.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (reason: string) => {
    const userId = rejectTarget?.userId;
    if (userId === undefined) return;
    setProcessingId(userId);
    try {
      await rejectClient(userId, reason);
      setClients((prev) => prev.filter((c) => c.userId !== userId));
      setToast({ type: "success", message: "반려되었습니다." });
      setRejectTarget(null);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "반려에 실패했습니다.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-[15px] text-mute">로딩 중...</div>;
  }

  if (clients.length === 0) {
    return (
      <div className="py-20 text-center bg-canvas-soft rounded-lg border border-hairline">
        <p className="text-body-md text-mute">승인 대기 중인 의뢰인이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-hairline">
        <table className="w-full min-w-[800px] text-left text-[15px] leading-6">
          <thead>
            <tr className="border-b border-hairline bg-canvas-soft text-mute">
              <th className="px-4 py-3 font-semibold">이메일</th>
              <th className="px-4 py-3 font-semibold">회사명</th>
              <th className="px-4 py-3 font-semibold">사업자번호</th>
              <th className="px-4 py-3 font-semibold">사업자 유형</th>
              <th className="px-4 py-3 font-semibold">지역</th>
              <th className="px-4 py-3 font-semibold">가입일</th>
              <th className="px-4 py-3 font-semibold">처리</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const isProcessing = processingId === c.userId;
              return (
                <tr key={c.userId} className="border-b border-hairline last:border-b-0">
                  <td className="px-4 py-3 text-ink">{c.email}</td>
                  <td className="px-4 py-3 text-ink">{c.companyName}</td>
                  <td className="px-4 py-3 text-body">{c.companyNumber}</td>
                  <td className="px-4 py-3 text-body">
                    {c.clientType ? CLIENT_TYPE_LABEL[c.clientType] ?? c.clientType : "-"}
                  </td>
                  <td className="px-4 py-3 text-body">{c.region}</td>
                  <td className="px-4 py-3 text-body">{formatDate(c.createdDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => c.userId !== undefined && handleApprove(c.userId)}
                        disabled={isProcessing}
                        className="h-9 rounded-md bg-primary px-3 text-[13px] font-semibold leading-5 text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        onClick={() => setRejectTarget(c)}
                        disabled={isProcessing}
                        className="h-9 rounded-md border border-hairline-strong bg-surface px-3 text-[13px] font-semibold leading-5 text-ink transition hover:border-ink disabled:opacity-50"
                      >
                        반려
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rejectTarget && (
        <RejectReasonModal
          isSubmitting={processingId === rejectTarget.userId}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}
    </>
  );
}

// ─── 신고 관리 탭 ─────────────────────────────────────────────────
function ReportsTab({ setToast }: { setToast: (t: ToastState) => void }) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTargetType, setFilterTargetType] = useState<AdminReportTargetType | "">("");
  const [filterStatus, setFilterStatus] = useState<AdminReportStatus | "">("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [handleTarget, setHandleTarget] = useState<ReportItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminReports(filterTargetType || undefined, filterStatus || undefined, page)
      .then((result) => {
        if (!active) return;
        setReports(result.content);
        setTotalPages(result.totalPages);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setToast({
          type: "error",
          message: error instanceof Error ? error.message : "신고 목록을 불러오는데 실패했습니다.",
        });
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [filterTargetType, filterStatus, page, refreshKey, setToast]);

  const handleProcess = async (accepted: boolean, dismissReason?: string) => {
    const reportId = handleTarget?.id;
    if (reportId === undefined) return;
    setProcessingId(reportId);
    try {
      await handleAdminReport(reportId, accepted, dismissReason);
      setToast({
        type: "success",
        message: accepted ? "신고를 수락했습니다." : "신고를 거절했습니다.",
      });
      setHandleTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (error) {
      setToast({
        type: "error",
        message: error instanceof Error ? error.message : "신고 처리에 실패했습니다.",
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      {/* 필터 바 */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filterTargetType}
          onChange={(e) => {
            setFilterTargetType(e.target.value as AdminReportTargetType | "");
            setPage(0);
          }}
          className="rounded-md border border-hairline bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary focus:outline-none"
        >
          <option value="">전체 유형</option>
          <option value="JOB_POSTING">공고</option>
          <option value="PROFILE">프로필</option>
          <option value="MESSAGE">쪽지</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value as AdminReportStatus | "");
            setPage(0);
          }}
          className="rounded-md border border-hairline bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary focus:outline-none"
        >
          <option value="">전체 상태</option>
          <option value="PENDING">대기</option>
          <option value="ACTIONED">처리완료</option>
          <option value="DISMISSED">거절</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-[15px] text-mute">로딩 중...</div>
      ) : reports.length === 0 ? (
        <div className="py-20 text-center bg-canvas-soft rounded-lg border border-hairline">
          <p className="text-body-md text-mute">신고 내역이 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full min-w-[960px] text-left text-[14px] leading-5">
            <thead>
              <tr className="border-b border-hairline bg-canvas-soft text-mute">
                <th className="px-4 py-3 font-semibold">유형</th>
                <th className="px-4 py-3 font-semibold">대상 ID</th>
                <th className="px-4 py-3 font-semibold">신고자 ID</th>
                <th className="px-4 py-3 font-semibold">사유</th>
                <th className="px-4 py-3 font-semibold">내용</th>
                <th className="px-4 py-3 font-semibold">상태</th>
                <th className="px-4 py-3 font-semibold">신고일</th>
                <th className="px-4 py-3 font-semibold">처리</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-hairline last:border-b-0 hover:bg-canvas-soft/50">
                  <td className="px-4 py-3 font-medium text-ink whitespace-nowrap">
                    {TARGET_TYPE_LABELS[r.targetType] ?? r.targetType}
                  </td>
                  <td className="px-4 py-3 text-body">{r.targetId}</td>
                  <td className="px-4 py-3 text-body">{r.reporterId}</td>
                  <td className="px-4 py-3 text-body whitespace-nowrap">
                    {REASON_LABELS[r.reason] ?? r.reason}
                  </td>
                  <td className="px-4 py-3 text-body max-w-[200px]">
                    <span className="block truncate" title={r.description}>
                      {r.description || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                        STATUS_COLORS[r.status] ?? "bg-canvas-soft text-body"
                      }`}
                    >
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body whitespace-nowrap">
                    {formatDate(r.createdDate)}
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "PENDING" ? (
                      <button
                        type="button"
                        onClick={() => setHandleTarget(r)}
                        disabled={processingId === r.id}
                        className="h-8 rounded-md bg-primary px-3 text-[13px] font-semibold text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
                      >
                        처리
                      </button>
                    ) : (
                      <span className="text-[13px] text-mute">완료</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-md border border-hairline px-4 py-2 text-[13px] font-semibold text-ink disabled:opacity-40 hover:bg-canvas-soft transition"
          >
            이전
          </button>
          <span className="text-[13px] text-mute">{page + 1} / {totalPages}</span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="rounded-md border border-hairline px-4 py-2 text-[13px] font-semibold text-ink disabled:opacity-40 hover:bg-canvas-soft transition"
          >
            다음
          </button>
        </div>
      )}

      {handleTarget && (
        <HandleReportModal
          report={handleTarget}
          isSubmitting={processingId === handleTarget.id}
          onClose={() => setHandleTarget(null)}
          onConfirm={handleProcess}
        />
      )}
    </>
  );
}
