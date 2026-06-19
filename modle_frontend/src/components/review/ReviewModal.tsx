"use client";

import { useState } from "react";
import { createReview } from "@/lib/api/review";

interface Props {
  applicationId: number;
  targetName: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function ReviewModal({ applicationId, targetName, onSuccess, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("별점을 선택해주세요.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      await createReview(applicationId, rating, content);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "리뷰 작성에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md border border-hairline bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <h2 className="text-[18px] font-bold text-ink">{targetName} 리뷰 작성</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] font-medium text-mute transition hover:text-ink"
          >
            닫기
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6">
          <div>
            <p className="mb-2 text-[13px] font-semibold text-ink">별점</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-3xl leading-none transition-colors"
                >
                  <span className={activeRating >= star ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 self-center text-[13px] text-mute">{rating}점</span>
              )}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-[13px] font-semibold text-ink">
              리뷰 내용 <span className="font-normal text-mute">(선택)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="촬영 경험을 남겨주세요."
              maxLength={500}
              rows={4}
              className="w-full resize-none border border-hairline bg-canvas px-3 py-2 text-[14px] text-ink placeholder:text-mute focus:border-ink focus:outline-none"
            />
            <p className="mt-1 text-right text-[12px] text-mute">{content.length}/500</p>
          </div>
          {error && <p className="text-[13px] text-error">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-10 flex-1 border border-hairline text-[13px] font-semibold text-mute transition hover:border-ink hover:text-ink"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="h-10 flex-1 bg-black text-[13px] font-semibold text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSubmitting ? "제출 중..." : "리뷰 작성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
