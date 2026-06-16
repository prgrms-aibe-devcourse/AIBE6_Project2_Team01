"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { Toast, type ToastState } from "@/components/ui/Toast";

const ROLE_LABEL: Record<string, string> = {
  MODEL: "모델",
  CLIENT: "의뢰인",
  ADMIN: "관리자",
};

const NAV_LINK_CLASS = "text-[13px] font-semibold leading-5 text-ink hover:underline";

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

export function NavBar() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 알림 패널 외부 클릭 시 닫기
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  const handleLogout = async () => {
    await logout();
    setToast({ type: "success", message: "로그아웃되었습니다." });
    router.push("/");
  };

  const isModelOrClient = user?.role === "MODEL" || user?.role === "CLIENT";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-hairline bg-canvas px-6">
      <Link href="/" className="text-[15px] font-bold leading-6 text-ink">
        Modle
      </Link>

      <div className="flex items-center gap-4">
        {isLoading ? null : user ? (
          <>
            {user.role === "ADMIN" ? (
              <Link href="/admin" className={NAV_LINK_CLASS}>
                관리자 페이지
              </Link>
            ) : (
              <>
                <Link href="/my/profile" className={NAV_LINK_CLASS}>
                  마이페이지
                </Link>
                <Link href="/jobs" className={NAV_LINK_CLASS}>
                  공고 목록
                </Link>
                <Link href="/models" className={NAV_LINK_CLASS}>
                  모델 목록
                </Link>
                {user.role === "CLIENT" && (
                  <Link href="/jobs/new" className={NAV_LINK_CLASS}>
                    공고 등록
                  </Link>
                )}
                <Link href="/messages" className={NAV_LINK_CLASS}>
                  쪽지
                </Link>

                {/* 알림 버튼 */}
                {isModelOrClient && (
                  <div ref={notifRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setNotifOpen((o) => !o)}
                      aria-label="알림"
                      aria-expanded={notifOpen}
                      className={`flex h-9 w-9 items-center justify-center rounded-md border transition ${
                        notifOpen
                          ? "border-primary text-primary bg-primary-soft"
                          : "border-hairline text-body hover:border-hairline-strong hover:text-ink"
                      }`}
                    >
                      <BellIcon />
                    </button>
                    {notifOpen && (
                      <NotificationPanel
                        role={user.role as "MODEL" | "CLIENT"}
                        onClose={() => setNotifOpen(false)}
                      />
                    )}
                  </div>
                )}
              </>
            )}

            <span className="text-[13px] leading-5 text-body">
              {ROLE_LABEL[user.role] ?? user.role} 계정
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="h-11 rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
            >
              로그아웃
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="inline-flex h-11 items-center rounded-md border border-hairline-strong bg-surface px-4 text-[15px] font-semibold leading-6 text-ink transition hover:border-ink"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-11 items-center rounded-md bg-primary px-4 text-[15px] font-semibold leading-6 text-on-primary transition hover:bg-primary-hover"
            >
              회원가입
            </Link>
          </>
        )}
      </div>

      {toast ? <Toast toast={toast} /> : null}
    </header>
  );
}
