"use client";

import { useEffect, useState } from "react";

import { RejectReasonModal } from "@/components/admin/RejectReasonModal";
import { Toast, type ToastState } from "@/components/ui/Toast";
import {
  approveClient,
  getPendingClients,
  rejectClient,
  type PendingClient,
} from "@/lib/api/admin";

const CLIENT_TYPE_LABEL: Record<string, string> = {
  INDIVIDUAL: "개인",
  ORGANIZATION: "법인",
};

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<PendingClient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PendingClient | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    let active = true;

    getPendingClients()
      .then((data) => {
        if (active) setClients(data);
      })
      .catch((error: unknown) => {
        if (active) {
          setToast({
            type: "error",
            message: error instanceof Error ? error.message : "승인 대기 목록을 불러오는데 실패했습니다.",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

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

  return (
    <main className="max-w-[1200px] mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-display-lg text-ink">의뢰인 승인 대기 목록</h1>
        <p className="text-body-lg text-body mt-2">
          신규 가입한 의뢰인의 승인 또는 반려를 처리할 수 있습니다.
        </p>
      </header>

      {isLoading ? null : clients.length === 0 ? (
        <div className="py-20 text-center bg-canvas-soft rounded-lg border border-hairline">
          <p className="text-body-md text-mute">승인 대기 중인 의뢰인이 없습니다.</p>
        </div>
      ) : (
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
      )}

      {rejectTarget && (
        <RejectReasonModal
          isSubmitting={processingId === rejectTarget.userId}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleReject}
        />
      )}

      {toast && <Toast toast={toast} />}
    </main>
  );
}
