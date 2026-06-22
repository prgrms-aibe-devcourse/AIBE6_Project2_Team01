"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { NotificationPanel } from "@/components/ui/NotificationPanel";
import { Toast, type ToastState } from "@/components/ui/Toast";
import { motion, AnimatePresence } from "framer-motion";
import { getMyModel } from "@/lib/api/model";
import { getMyClient } from "@/lib/api/clientProfile";

const ROLE_LABEL: Record<string, string> = {
  MODEL: "모델",
  CLIENT: "의뢰인",
  ADMIN: "관리자",
};

const NAV_LINK_CLASS = "text-[14px] font-medium leading-5 text-gray-300 hover:text-white transition-colors relative group";

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
  const [userName, setUserName] = useState<string | null>(null);
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

  // 사용자 이름 가져오기
  useEffect(() => {
    if (!user) {
      setUserName(null);
      return;
    }

    if (user.role === "ADMIN") {
      setUserName("관리자");
    } else if (user.role === "MODEL") {
      getMyModel()
        .then((m) => setUserName(m.name))
        .catch(() => setUserName("모델"));
    } else if (user.role === "CLIENT") {
      getMyClient()
        .then((c) => setUserName(c.companyName || "의뢰인"))
        .catch(() => setUserName("의뢰인"));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setToast({ type: "success", message: "로그아웃되었습니다." });
    router.push("/");
  };

  const isModelOrClient = user?.role === "MODEL" || user?.role === "CLIENT";

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-black/90 backdrop-blur-lg px-6 shadow-sm transition-all duration-300">
      <Link href="/" className="flex items-center gap-2 group">
        <Image src="/icon.svg" alt="Modle Logo" width={36} height={36} className="rounded-[10px] transition-transform group-hover:scale-105 invert" />
        <span className="text-[18px] font-extrabold tracking-tight leading-6 text-white group-hover:text-gray-200 transition-colors">
          Modle
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 mr-2">
          <Link href="/jobs" className={NAV_LINK_CLASS}>
            공고 목록
          </Link>
          <span className="w-px h-3 bg-white/20 mx-2"></span>
          <Link href="/models" className={NAV_LINK_CLASS}>
            모델 목록
          </Link>
        </div>

        {isLoading ? null : user ? (
          <div className="flex items-center gap-2 bg-white/10 px-2 py-1.5 rounded-full border border-white/10 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.1)]">
            {user.role === "ADMIN" ? (
              <div className="flex items-center px-3">
                <Link href="/admin" className={NAV_LINK_CLASS}>
                  관리자 페이지
                </Link>
              </div>
            ) : (
              <div className="flex items-center px-2">
                <Link href="/my/profile" className={NAV_LINK_CLASS}>
                  마이페이지
                </Link>
                {user.role === "CLIENT" && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/30 mx-3"></span>
                    <Link href="/jobs/new" className={NAV_LINK_CLASS}>
                      공고 등록
                    </Link>
                  </>
                )}
                {/* 쪽지 (메일함 아이콘) */}
                {isModelOrClient && (
                  <Link href="/messages" className="relative ml-2 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-gray-300 hover:border-white/50 hover:text-white hover:bg-white/10 transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center gap-3 pl-2 pr-1 border-l border-white/20 ml-1">
              <span className="text-[13px] font-bold tracking-wide text-white">
                {userName ? `${userName}님` : `${ROLE_LABEL[user.role] ?? user.role}님`}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleLogout}
                className="h-8 rounded-full border border-white/20 bg-white/5 px-3 text-[12px] font-medium text-gray-300 transition-colors hover:border-white hover:bg-white hover:text-ink"
              >
                로그아웃
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 ml-2">
            <Link
              href="/login"
              className="inline-flex h-9 items-center rounded-full border border-white/20 bg-transparent px-5 text-[13px] font-medium leading-6 text-gray-300 transition-colors hover:border-white hover:text-white"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center rounded-full bg-white px-5 text-[13px] font-bold leading-6 text-black transition-transform hover:scale-105"
            >
              회원가입
            </Link>
          </div>
        )}
      </div>

      {toast ? <Toast toast={toast} /> : null}
    </header>
  );
}
