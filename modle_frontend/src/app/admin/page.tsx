"use client";

import { useEffect, useRef, useState } from "react";

import { HandleReportModal } from "@/components/admin/HandleReportModal";
import { RejectReasonModal } from "@/components/admin/RejectReasonModal";
import { Toast, type ToastState } from "@/components/ui/Toast";
import {
  approveClient,
  getAdminReports,
  getNoShowReports,
  getWarnedUsers,
  getPendingClients,
  handleAdminReport,
  rejectClient,
  suspendUser,
  type AdminReportStatus,
  type AdminReportTargetType,
  type NoShowReportItem,
  type PendingClient,
  type ReportItem,
  type WarnedUserItem,
} from "@/lib/api/admin";

// ─── 상수 ────────────────────────────────────────────────────────
const CLIENT_TYPE_LABEL: Record<string, string> = {
  INDIVIDUAL: "개인",
  ORGANIZATION: "법인",
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  JOB_POSTING: "공고 신고",
  PROFILE: "프로필 신고",
  MESSAGE: "쪽지 신고",
  NO_SHOW: "노쇼 신고",
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

const USER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "정상",
  SUSPENDED: "정지",
  PENDING: "대기",
  REJECTED: "반려",
  WITHDRAWN: "탈퇴",
};

const ROLE_LABELS: Record<string, string> = {
  MODEL: "모델",
  CLIENT: "의뢰인",
  ADMIN: "관리자",
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

// ─── 루트 페이지 ─────────────────────────────────────────────────
type Tab = "clients" | "reports" | "general-reports" | "noshow" | "warnings";

const TABS: { key: Tab; label: string }[] = [
  { key: "clients", label: "의뢰인 승인" },
  { key: "reports", label: "신고 관리" },
  { key: "general-reports", label: "일반 신고" },
  { key: "noshow", label: "노쇼 신고" },
  { key: "warnings", label: "경고 유저" },
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
      <div className="flex gap-0 border-b border-hairline mb-8 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`whitespace-nowrap px-6 py-3 text-[14px] font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "border-primary text-primary"
                : "border-transparent text-mute hover:text-ink"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === "clients" && <ClientsTab setToast={setToast} />}
      {activeTab === "reports" && <ReportsTab setToast={setToast} />}
      {activeTab === "general-reports" && <GeneralReportsTab setToast={setToast} />}
      {activeTab === "noshow" && <NoShowTab setToast={setToast} />}
      {activeTab === "warnings" && <WarningsTab setToast={setToast} />}

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

  if (isLoading) return <div className="py-20 text-center text-[15px] text-mute">로딩 중...</div>;

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

// ─── 신고 관리 탭 (기존) ──────────────────────────────────────────
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
    setIsLoading(true);
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
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={filterTargetType}
          onChange={(e) => { setFilterTargetType(e.target.value as AdminReportTargetType | ""); setPage(0); }}
          className="rounded-md border border-hairline bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary focus:outline-none"
        >
          <option value="">전체 유형</option>
          <option value="JOB_POSTING">공고</option>
          <option value="PROFILE">프로필</option>
          <option value="MESSAGE">쪽지</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as AdminReportStatus | ""); setPage(0); }}
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
                    <span className="block truncate" title={r.description}>{r.description || "-"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_COLORS[r.status] ?? "bg-canvas-soft text-body"}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body whitespace-nowrap">{formatDate(r.createdDate)}</td>
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

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
            className="rounded-md border border-hairline px-4 py-2 text-[13px] font-semibold text-ink disabled:opacity-40 hover:bg-canvas-soft transition">
            이전
          </button>
          <span className="text-[13px] text-mute">{page + 1} / {totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
            className="rounded-md border border-hairline px-4 py-2 text-[13px] font-semibold text-ink disabled:opacity-40 hover:bg-canvas-soft transition">
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

// ─── 일반 신고 탭 (PENDING 중심, 인라인 처리) ────────────────────
function GeneralReportsTab({ setToast }: { setToast: (t: ToastState) => void }) {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterTargetType, setFilterTargetType] = useState<AdminReportTargetType | "">("");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [dismissTarget, setDismissTarget] = useState<number | null>(null);
  const [dismissReason, setDismissReason] = useState("");

  const load = () => {
    setIsLoading(true);
    getAdminReports(filterTargetType || undefined, "PENDING", 0, 50)
      .then((result) => setReports(result.content))
      .catch((error: unknown) => {
        setToast({
          type: "error",
          message: error instanceof Error ? error.message : "신고 목록을 불러오는데 실패했습니다.",
        });
      })
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, [filterTargetType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAccept = async (reportId: number) => {
    setProcessingId(reportId);
    try {
      await handleAdminReport(reportId, true);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      setToast({ type: "success", message: "신고를 수락했습니다." });
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "처리에 실패했습니다." });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDismiss = async () => {
    if (dismissTarget === null || !dismissReason.trim()) return;
    setProcessingId(dismissTarget);
    try {
      await handleAdminReport(dismissTarget, false, dismissReason.trim());
      setReports((prev) => prev.filter((r) => r.id !== dismissTarget));
      setToast({ type: "success", message: "신고를 거절했습니다." });
      setDismissTarget(null);
      setDismissReason("");
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "처리에 실패했습니다." });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      {/* 거절 사유 모달 */}
      {dismissTarget !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-xl">
            <h3 className="mb-4 text-[16px] font-bold text-ink">신고 거절 사유</h3>
            <textarea
              rows={4}
              value={dismissReason}
              onChange={(e) => setDismissReason(e.target.value)}
              placeholder="거절 사유를 입력해주세요."
              className="w-full resize-none rounded-md border border-hairline bg-canvas-soft px-3 py-2 text-[14px] text-ink placeholder:text-mute focus:border-primary focus:outline-none"
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => { setDismissTarget(null); setDismissReason(""); }}
                className="h-10 flex-1 rounded-md border border-hairline bg-surface text-[13px] font-semibold text-ink transition hover:border-hairline-strong"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                disabled={!dismissReason.trim() || processingId === dismissTarget}
                className="h-10 flex-1 rounded-md bg-error px-4 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {processingId === dismissTarget ? "처리 중..." : "거절 확정"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-5">
        <select
          value={filterTargetType}
          onChange={(e) => setFilterTargetType(e.target.value as AdminReportTargetType | "")}
          className="rounded-md border border-hairline bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary focus:outline-none"
        >
          <option value="">전체 유형</option>
          <option value="JOB_POSTING">공고 신고</option>
          <option value="PROFILE">프로필 신고</option>
          <option value="MESSAGE">쪽지 신고</option>
        </select>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-[15px] text-mute">로딩 중...</div>
      ) : reports.length === 0 ? (
        <div className="py-20 text-center bg-canvas-soft rounded-lg border border-hairline">
          <p className="text-body-md text-mute">처리할 신고가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-lg border border-hairline bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1 text-[13px]">
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className="font-semibold text-ink">
                      {TARGET_TYPE_LABELS[r.targetType] ?? r.targetType}
                    </span>
                    <span className="text-mute">사유: {REASON_LABELS[r.reason] ?? r.reason}</span>
                    <span className="text-mute">신고일: {formatDate(r.createdDate)}</span>
                  </div>
                  {r.description && (
                    <p className="text-body mt-1 line-clamp-2">{r.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => handleAccept(r.id)}
                    disabled={processingId === r.id}
                    className="h-8 rounded-md bg-primary px-3 text-[13px] font-semibold text-on-primary transition hover:bg-primary-hover disabled:opacity-50"
                  >
                    {processingId === r.id ? "처리 중..." : "수락"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDismissTarget(r.id); setDismissReason(""); }}
                    disabled={processingId === r.id}
                    className="h-8 rounded-md border border-hairline-strong bg-surface px-3 text-[13px] font-semibold text-ink transition hover:border-ink disabled:opacity-50"
                  >
                    거절
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ─── 노쇼 신고 탭 ─────────────────────────────────────────────────
function NoShowTab({ setToast }: { setToast: (t: ToastState) => void }) {
  const [reports, setReports] = useState<NoShowReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<NoShowReportItem | null>(null);

  useEffect(() => {
    let active = true;
    getNoShowReports()
      .then((data) => { if (active) setReports(data); })
      .catch((error: unknown) => {
        if (!active) return;
        setToast({ type: "error", message: error instanceof Error ? error.message : "노쇼 신고 목록을 불러오는데 실패했습니다." });
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [setToast]);

  const handleSuspend = async () => {
    if (!confirmTarget) return;
    setProcessingId(confirmTarget.modelUserId);
    try {
      await suspendUser(confirmTarget.modelUserId);
      setReports((prev) => prev.filter((r) => r.reportId !== confirmTarget.reportId));
      setToast({ type: "success", message: `${confirmTarget.modelName} 계정이 정지되었습니다.` });
      setConfirmTarget(null);
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "계정 정지에 실패했습니다." });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      {/* 정지 확인 모달 */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-hairline bg-surface p-6 shadow-xl">
            <h3 className="mb-2 text-[16px] font-bold text-ink">계정 정지 확인</h3>
            <p className="mb-1 text-[14px] text-body">
              <span className="font-semibold text-ink">{confirmTarget.modelName}</span> 모델의 계정을 정지하시겠습니까?
            </p>
            <p className="mb-5 text-[13px] text-mute">현재 경고 횟수: {confirmTarget.warningCount}회</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmTarget(null)}
                className="h-10 flex-1 rounded-md border border-hairline bg-surface text-[13px] font-semibold text-ink transition hover:border-hairline-strong">
                취소
              </button>
              <button type="button" onClick={handleSuspend}
                disabled={processingId === confirmTarget.modelUserId}
                className="h-10 flex-1 rounded-md bg-error px-4 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {processingId === confirmTarget.modelUserId ? "처리 중..." : "정지 확인"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center text-[15px] text-mute">로딩 중...</div>
      ) : reports.length === 0 ? (
        <div className="py-20 text-center bg-canvas-soft rounded-lg border border-hairline">
          <p className="text-body-md text-mute">노쇼 신고가 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full min-w-[600px] text-left text-[14px] leading-5">
            <thead>
              <tr className="border-b border-hairline bg-canvas-soft text-mute">
                <th className="px-4 py-3 font-semibold">모델명</th>
                <th className="px-4 py-3 font-semibold">경고 횟수</th>
                <th className="px-4 py-3 font-semibold">신고 접수일</th>
                <th className="px-4 py-3 font-semibold">처리</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.reportId} className="border-b border-hairline last:border-b-0 hover:bg-canvas-soft/50">
                  <td className="px-4 py-3 font-medium text-ink">{r.modelName}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[12px] font-semibold text-amber-700">
                      {r.warningCount}회
                    </span>
                  </td>
                  <td className="px-4 py-3 text-body whitespace-nowrap">{formatDate(r.reportedAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setConfirmTarget(r)}
                      disabled={processingId === r.modelUserId}
                      className="h-8 rounded-md bg-error px-3 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      계정 정지
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ─── 경고 유저 탭 ─────────────────────────────────────────────────
function WarningsTab({ setToast }: { setToast: (t: ToastState) => void }) {
  const [users, setUsers] = useState<WarnedUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [minCount, setMinCount] = useState(3);
  const [inputCount, setInputCount] = useState("3");
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [suspendedIds, setSuspendedIds] = useState<Set<number>>(new Set());
  const [confirmTarget, setConfirmTarget] = useState<WarnedUserItem | null>(null);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    getWarnedUsers(minCount)
      .then((data) => { if (active) setUsers(data); })
      .catch((error: unknown) => {
        if (!active) return;
        setToast({ type: "error", message: error instanceof Error ? error.message : "경고 유저 목록을 불러오는데 실패했습니다." });
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [minCount, setToast]);

  const handleSuspend = async () => {
    if (!confirmTarget) return;
    setProcessingId(confirmTarget.id);
    try {
      await suspendUser(confirmTarget.id);
      setSuspendedIds((prev) => new Set(prev).add(confirmTarget.id));
      setToast({ type: "success", message: "계정이 정지되었습니다." });
      setConfirmTarget(null);
    } catch (error) {
      setToast({ type: "error", message: error instanceof Error ? error.message : "계정 정지에 실패했습니다." });
    } finally {
      setProcessingId(null);
    }
  };

  const applyFilter = () => {
    const n = parseInt(inputCount, 10);
    if (!isNaN(n) && n >= 0) setMinCount(n);
  };

  return (
    <>
      {/* 정지 확인 모달 */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg border border-hairline bg-surface p-6 shadow-xl">
            <h3 className="mb-2 text-[16px] font-bold text-ink">계정 정지 확인</h3>
            <p className="mb-5 text-[14px] text-body">
              유저 ID <span className="font-semibold text-ink">#{confirmTarget.id}</span>의 계정을 정지하시겠습니까?
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirmTarget(null)}
                className="h-10 flex-1 rounded-md border border-hairline bg-surface text-[13px] font-semibold text-ink transition hover:border-hairline-strong">
                취소
              </button>
              <button type="button" onClick={handleSuspend}
                disabled={processingId === confirmTarget.id}
                className="h-10 flex-1 rounded-md bg-error px-4 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
                {processingId === confirmTarget.id ? "처리 중..." : "정지 확인"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="mb-5 flex items-center gap-3">
        <label className="text-[13px] font-semibold text-ink">경고 횟수 기준:</label>
        <input
          type="number"
          min={0}
          value={inputCount}
          onChange={(e) => setInputCount(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilter()}
          className="w-20 rounded-md border border-hairline bg-surface px-3 py-2 text-[13px] text-ink focus:border-primary focus:outline-none"
        />
        <span className="text-[13px] text-mute">회 이상</span>
        <button
          type="button"
          onClick={applyFilter}
          className="h-9 rounded-md bg-primary px-4 text-[13px] font-semibold text-on-primary transition hover:bg-primary-hover"
        >
          조회
        </button>
      </div>

      {/* 백엔드 제약 안내 */}
      <p className="mb-4 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-[12px] text-amber-700">
        ※ 현재 백엔드 응답에 이름·이메일·경고 횟수가 포함되지 않습니다. 백엔드 수정 후 상세 정보 표시 가능합니다.
      </p>

      {isLoading ? (
        <div className="py-20 text-center text-[15px] text-mute">로딩 중...</div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center bg-canvas-soft rounded-lg border border-hairline">
          <p className="text-body-md text-mute">해당 조건의 유저가 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-hairline">
          <table className="w-full min-w-[500px] text-left text-[14px] leading-5">
            <thead>
              <tr className="border-b border-hairline bg-canvas-soft text-mute">
                <th className="px-4 py-3 font-semibold">유저 ID</th>
                <th className="px-4 py-3 font-semibold">역할</th>
                <th className="px-4 py-3 font-semibold">현재 상태</th>
                <th className="px-4 py-3 font-semibold">가입일</th>
                <th className="px-4 py-3 font-semibold">처리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSuspended = u.status === "SUSPENDED" || suspendedIds.has(u.id);
                return (
                  <tr key={u.id} className="border-b border-hairline last:border-b-0 hover:bg-canvas-soft/50">
                    <td className="px-4 py-3 text-ink font-medium">#{u.id}</td>
                    <td className="px-4 py-3 text-body">{ROLE_LABELS[u.role] ?? u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                        isSuspended ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
                      }`}>
                        {isSuspended ? "정지" : (USER_STATUS_LABELS[u.status] ?? u.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body whitespace-nowrap">{formatDate(u.createDate)}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setConfirmTarget(u)}
                        disabled={isSuspended || processingId === u.id}
                        className="h-8 rounded-md bg-error px-3 text-[13px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isSuspended ? "정지됨" : "계정 정지"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
