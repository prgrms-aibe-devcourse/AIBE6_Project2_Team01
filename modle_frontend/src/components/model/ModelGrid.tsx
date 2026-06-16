"use client";

import { MouseEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Model } from '@/types/model';
import { ModelCard } from './ModelCard';
import { useAuth } from '@/hooks/useAuth';
import {
  addModelBookmark,
  getModelBookmarks,
  removeModelBookmark,
} from '@/lib/api/bookmark';

export function ModelGrid({ models }: { models: Model[] }) {
  const { user } = useAuth();
  const isClient = user?.role === 'CLIENT';
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());

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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {models.map((model) => (
        <Link key={model.id} href={`/models/${model.id}`}>
          <ModelCard
            model={model}
            bookmarked={bookmarkedIds.has(model.id)}
            showBookmark={isClient}
            onBookmarkToggle={
              isClient ? (e) => handleBookmarkToggle(e, model.id) : undefined
            }
          />
        </Link>
      ))}
    </div>
  );
}
