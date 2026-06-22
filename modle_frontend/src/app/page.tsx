"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Alert } from "@/components/ui/Alert";
import { JobCard } from "@/components/jobposting/JobCard";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Star, Users, MapPin } from "lucide-react";
import { client } from "@/lib/api/client";
import { getJobBookmarks, addJobBookmark, removeJobBookmark } from "@/lib/api/bookmark";
import type { components } from "@/lib/api/schema";
import { getRegionLabel } from "@/lib/constants/region";

type JobListItem = components["schemas"]["JobPostingListResponse"];

const ROLE_LABEL: Record<string, string> = {
  MODEL: "모델",
  CLIENT: "의뢰인",
  ADMIN: "관리자",
};

const PRIMARY_CTA_CLASS =
  "inline-flex h-14 items-center justify-center rounded-full bg-ink px-10 text-[16px] font-bold leading-6 text-canvas transition-all hover:scale-105 hover:shadow-2xl hover:shadow-black/20 active:scale-95";

const SECONDARY_CTA_CLASS =
  "inline-flex h-14 items-center justify-center rounded-full border border-hairline-strong bg-white/50 backdrop-blur-md px-10 text-[16px] font-bold leading-6 text-ink transition-all hover:bg-white hover:border-ink hover:scale-105 shadow-sm active:scale-95";

const FEATURES = [
  {
    icon: <Users className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />,
    title: "검증된 프로필",
    desc: "신뢰할 수 있는 모델과 의뢰인의 상세한 포트폴리오를 확인하세요.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-fuchsia-400 drop-shadow-[0_0_15px_rgba(232,121,249,0.5)]" />,
    title: "직관적인 매칭",
    desc: "원하는 조건에 맞는 파트너를 빠르고 쉽게 찾을 수 있습니다.",
  },
  {
    icon: <Star className="w-8 h-8 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />,
    title: "투명한 리뷰",
    desc: "실제 작업 후기를 통해 더 확실한 선택을 경험해 보세요.",
  },
];

export default function Home() {
  const { user, isLoading } = useAuth();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -100]);

  const [topJobs, setTopJobs] = useState<JobListItem[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (user?.role !== "MODEL") return;
    getJobBookmarks()
      .then((bookmarks) => {
        setFavoritedIds(new Set(bookmarks.map((b) => b.jobPostingId)));
      })
      .catch(() => {});
  }, [user?.role]);

  const toggleFavorite = async (id: number) => {
    const wasBookmarked = favoritedIds.has(id);
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (wasBookmarked) await removeJobBookmark(id);
      else await addJobBookmark(id);
    } catch {
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  useEffect(() => {
    // Fetch top 3 latest/popular jobs
    client
      .GET("/api/v1/jobs", {
        params: { query: { page: 0, size: 3 } },
      })
      .then(({ data }) => {
        if (data?.data?.content) {
          setTopJobs(data.data.content);
        }
        setLoadingJobs(false);
      })
      .catch(() => setLoadingJobs(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-canvas">
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="h-10 w-10 rounded-full bg-ink/20"
        />
      </div>
    );
  }

  // 통합 랜딩 뷰 (로그인 여부 무관)
  return (
    <main className="flex min-h-screen flex-col bg-canvas text-ink overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-center px-6 pt-32 pb-24 min-h-[90vh] max-w-7xl mx-auto w-full gap-12">
        {/* Dim Layer for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/50 to-transparent pointer-events-none z-0 hidden md:block" />
        <div className="absolute inset-0 bg-white/60 pointer-events-none z-0 md:hidden" />

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 z-10"
        >
          <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] text-ink drop-shadow-sm break-keep">
            <span className="whitespace-nowrap">당신의 브랜드를</span> <br />
            완성할 <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-600 to-gray-400">파트너</span>
          </h1>
          
          <p className="mt-8 text-xl leading-relaxed text-gray-800 max-w-lg font-bold drop-shadow-sm">
            가장 돋보이는 모델 포트폴리오와 검증된 클라이언트를 만나는 곳. 모들에서 성공적인 작업을 시작하세요.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mt-12"
          >
            {user ? (
              <>
                <Link href="/jobs" className={PRIMARY_CTA_CLASS}>
                  공고 둘러보기 <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                {user.role === "CLIENT" && (
                  <Link href="/jobs/new" className={SECONDARY_CTA_CLASS}>
                    신규 공고 등록하기
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link href="/signup" className={PRIMARY_CTA_CLASS}>
                  지금 바로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link href="/models" className={SECONDARY_CTA_CLASS}>
                  모델 둘러보기
                </Link>
              </>
            )}
          </motion.div>
        </motion.div>

        {/* Hero Image / Graphic (Fade-in Animation) */}
        <motion.div 
          initial={{ opacity: 0, filter: "blur(10px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex-1 relative w-full aspect-[4/5] md:aspect-auto md:h-[700px] rounded-[3rem] overflow-hidden shadow-2xl -z-10 md:z-10"
        >
          <img
            src="/images/hero.png"
            alt="Fashion Model"
            className="object-cover w-full h-full"
          />
        </motion.div>
      </section>

      {/* Smooth Curved SVG Transition */}
      <div className="relative w-full overflow-hidden leading-[0] bg-transparent transform translate-y-1 z-10">
        <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24 fill-ink">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C70.66,33.56,151.78,57.17,243.6,56.44Z"></path>
        </svg>
      </div>

      {/* Feature Section (Dark Theme for Contrast, Curved Bottom) */}
      <section 
        className="py-32 pb-32 px-6 bg-ink text-canvas relative z-10 -mt-1" 
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">왜 모들(Modle)인가요?</h2>
            <p className="mt-5 text-gray-400 text-xl font-medium">최고의 경험을 위한 핵심 기능</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.15, type: "spring", bounce: 0.4 }}
                whileHover={{ y: -10 }}
                className="group flex flex-col items-center text-center p-10 rounded-[2.5rem] bg-white/5 border border-white/10 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)] hover:bg-white/10"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <span className="text-white">{feature.icon}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Wave Transition to gray-50 */}
        <div className="absolute bottom-[-1px] left-0 w-full overflow-hidden leading-[0]">
          <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-24">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C70.66,33.56,151.78,57.17,243.6,56.44Z" className="fill-gray-50"></path>
          </svg>
        </div>
      </section>

      {/* Top 3 Featured Jobs Section */}
      <section className="py-24 px-6 bg-gray-50 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6"
          >
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-3">🔥 최신 인기 공고</h2>
              <p className="text-gray-500 text-lg font-medium">지금 가장 핫한 모델 모집 공고를 확인하세요.</p>
            </div>
            <Link href="/jobs" className="text-ink font-bold hover:underline flex items-center">
              공고 전체보기 <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </motion.div>

          {loadingJobs ? (
            <div className="flex justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-gray-300 border-t-ink rounded-full" />
            </div>
          ) : (
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {topJobs.map((job) => (
                <motion.div
                  key={job.id}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
                  }}
                >
                  <JobCard 
                    job={job} 
                    isFavorited={favoritedIds.has(job.id!)}
                    onToggleFavorite={user?.role === "MODEL" ? (e, id) => {
                      e.preventDefault();
                      toggleFavorite(id);
                    } : undefined}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-32 px-6 bg-ink text-canvas text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, type: "spring" }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-8">지금 바로 합류하세요</h2>
          <p className="text-gray-400 text-xl md:text-2xl mb-12">프로필을 등록하고 새로운 기회를 발견해 보세요.</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
            <Link href="/signup" className="inline-flex h-16 items-center justify-center rounded-full bg-white px-12 text-[18px] font-extrabold leading-6 text-ink shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-shadow">
              무료로 시작하기
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
