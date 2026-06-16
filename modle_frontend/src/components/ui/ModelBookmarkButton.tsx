"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  addModelBookmark,
  getModelBookmarks,
  removeModelBookmark,
} from "@/lib/api/bookmark";

type Props = {
  modelId: number;
  className?: string;
};

export function ModelBookmarkButton({ modelId, className }: Props) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "CLIENT") return;
    getModelBookmarks()
      .then((bookmarks) => {
        setBookmarked(bookmarks.some((b) => b.modelId === modelId));
      })
      .catch(() => {});
  }, [user, modelId]);

  if (user?.role !== "CLIENT") return null;

  const handleToggle = async () => {
    if (loading) return;
    setLoading(true);
    const was = bookmarked;
    setBookmarked(!was);
    try {
      if (was) await removeModelBookmark(modelId);
      else await addModelBookmark(modelId);
    } catch {
      setBookmarked(was);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={className}
    >
      {bookmarked ? "♥ 관심 모델" : "♡ 관심 모델"}
    </button>
  );
}
