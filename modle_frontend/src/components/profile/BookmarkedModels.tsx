"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  addModelBookmark,
  getModelBookmarks,
  removeModelBookmark,
  type ModelBookmark,
} from "@/lib/api/bookmark";

export function BookmarkedModels() {
  const [models, setModels] = useState<ModelBookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [undoTarget, setUndoTarget] = useState<ModelBookmark | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getModelBookmarks()
      .then(setModels)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => () => { if (undoTimer.current) clearTimeout(undoTimer.current); }, []);

  const handleRemove = async (model: ModelBookmark) => {
    setModels((prev) => prev.filter((m) => m.modelId !== model.modelId));
    if (undoTimer.current) clearTimeout(undoTimer.current);
    setUndoTarget(model);
    undoTimer.current = setTimeout(() => setUndoTarget(null), 5000);
    try {
      await removeModelBookmark(model.modelId);
    } catch {
      setModels((prev) => [model, ...prev]);
      setUndoTarget(null);
    }
  };

  const handleUndo = async () => {
    if (!undoTarget) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    const target = undoTarget;
    setUndoTarget(null);
    setModels((prev) => [target, ...prev]);
    try {
      await addModelBookmark(target.modelId);
    } catch {
      setModels((prev) => prev.filter((m) => m.modelId !== target.modelId));
    }
  };

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-gray-500">로딩 중...</div>;
  }

  if (error) {
    return <div className="py-20 text-center text-sm text-red-500">{error}</div>;
  }

  if (models.length === 0 && !undoTarget) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">
          관심 모델이 없습니다.
        </p>
        <Link href="/models" className="mt-4 inline-block text-sm text-black underline underline-offset-2">
          모델 목록 보러 가기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-black uppercase tracking-widest border-b-2 border-black pb-3 mb-6">
        관심 모델
      </h2>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {models.map((m) => (
          <li key={m.modelId} className="relative group/card">
            <Link href={`/models/${m.modelId}`} className="block group">
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 mb-2">
                <Image
                  src={m.profileImageUrl || "/placeholder.png"}
                  alt={m.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="text-[14px] font-extrabold text-black tracking-widest uppercase">
                {m.name}
              </p>
              <p className="mt-0.5 text-[12px] text-gray-400">
                {new Date(m.createdDate).toLocaleDateString("ko-KR")} 저장
              </p>
            </Link>

            {/* 북마크 해제 버튼 */}
            <button
              type="button"
              onClick={() => handleRemove(m)}
              aria-label="북마크 해제"
              className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center bg-white/80 rounded-full text-[15px] text-red-400 hover:text-red-600 hover:bg-white transition opacity-0 group-hover/card:opacity-100 shadow-sm"
            >
              ♥
            </button>
          </li>
        ))}
      </ul>

      {/* Undo 토스트 */}
      {undoTarget && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-lg bg-gray-900 px-5 py-3 text-white shadow-xl">
          <span className="text-[14px]">관심 모델이 해제되었습니다.</span>
          <button
            type="button"
            onClick={handleUndo}
            className="text-[14px] font-bold text-yellow-300 underline underline-offset-2 hover:text-yellow-200"
          >
            실행 취소
          </button>
        </div>
      )}
    </div>
  );
}
