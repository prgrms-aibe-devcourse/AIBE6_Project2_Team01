"use client";

import { MouseEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Model } from '@/types/model';
import { ModelCard } from './ModelCard';
import { useAuth } from '@/hooks/useAuth';
import {
  addModelBookmark,
  getModelBookmarks,
  removeModelBookmark,
} from '@/lib/api/bookmark';
import { useRouter } from 'next/navigation';

export function ModelGrid({ 
  models, 
  totalPages, 
  currentPage,
  searchParams 
}: { 
  models: Model[], 
  totalPages: number, 
  currentPage: number,
  searchParams: Record<string, string | string[] | undefined> 
}) {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    if (!isClient) return;
    getModelBookmarks()
      .then((bookmarks) => {
        setBookmarkedIds(new Set(bookmarks.map((b) => b.modelId)));
      })
      .catch(() => {});
  }, [isClient]);

  const handleBookmarkToggle = async (e: MouseEvent, modelId: number) => {
    e.preventDefault();
    e.stopPropagation();
    const wasBookmarked = bookmarkedIds.has(modelId);
    // 낙관적 업데이트
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (wasBookmarked) next.delete(modelId);
      else next.add(modelId);
      return next;
    });
    try {
      if (wasBookmarked) await removeModelBookmark(modelId);
      else await addModelBookmark(modelId);
    } catch {
      // 실패 시 롤백
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (wasBookmarked) next.add(modelId);
        else next.delete(modelId);
        return next;
      });
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    for (const key in searchParams) {
      if (key !== 'page' && searchParams[key]) {
        params.append(key, String(searchParams[key]));
      }
    }
    params.append('page', String(page));
    router.push(`/models?${params.toString()}`);
  };

  // 페이징 바 계산
  const MAX_PAGE_BUTTONS = 5;
  const startPage = Math.max(0, Math.floor(currentPage / MAX_PAGE_BUTTONS) * MAX_PAGE_BUTTONS);
  const endPage = Math.min(totalPages - 1, startPage + MAX_PAGE_BUTTONS - 1);
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex flex-col gap-10 pb-10">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.08
            }
          }
        }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
      >
        {models.map((model) => (
          <motion.div 
            key={model.id}
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.4 } }
            }}
          >
            <Link href={`/models/${model.id}`} className="block h-full">
              <ModelCard
                model={model}
                bookmarked={bookmarkedIds.has(model.id)}
                showBookmark={isClient}
                onBookmarkToggle={
                  isClient ? (e) => handleBookmarkToggle(e, model.id) : undefined
                }
              />
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          {/* 이전 그룹 버튼 */}
          <button 
            onClick={() => handlePageChange(startPage - 1)}
            disabled={startPage === 0}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            &lt;
          </button>

          {/* 페이지 숫자 버튼들 */}
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => handlePageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-bold ${
                currentPage === p 
                  ? 'bg-black text-white' 
                  : 'border border-gray-300 hover:bg-gray-50 text-black'
              }`}
            >
              {p + 1}
            </button>
          ))}

          {/* 다음 그룹 버튼 */}
          <button 
            onClick={() => handlePageChange(endPage + 1)}
            disabled={endPage === totalPages - 1}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
}
