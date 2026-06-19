"use client";

import { useEffect, useState } from "react";
import { getReviews, type ReviewResponse } from "@/lib/api/review";

interface Props {
  targetUserId: number;
  totalCount?: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-[15px] leading-none">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={rating >= star ? "text-yellow-400" : "text-gray-200"}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewList({ targetUserId, totalCount }: Props) {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.resolve().then(() => setIsLoading(true));
    getReviews(targetUserId)
      .then(setReviews)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "리뷰를 불러오지 못했습니다."),
      )
      .finally(() => setIsLoading(false));
  }, [targetUserId]);

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-gray-400">로딩 중...</div>;
  }

  if (error) {
    return <div className="py-16 text-center text-sm text-red-400">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-gray-400">
          아직 작성된 리뷰가 없습니다.
        </p>
      </div>
    );
  }

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      {/* 요약 */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
        <span className="text-3xl font-black text-black">{avgRating.toFixed(1)}</span>
        <div>
          <StarRating rating={Math.round(avgRating)} />
          <p className="mt-1 text-[12px] text-gray-400">
            총 {totalCount ?? reviews.length}개 리뷰
          </p>
        </div>
      </div>

      {/* 목록 */}
      <ul className="space-y-4">
        {reviews.map((review) => (
          <li key={review.id} className="border border-gray-100 bg-white p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <StarRating rating={review.rating} />
              <span className="text-[12px] text-gray-400">
                {new Date(review.createdDate).toLocaleDateString("ko-KR")}
              </span>
            </div>
            {review.content ? (
              <p className="whitespace-pre-line text-[14px] leading-6 text-gray-700">
                {review.content}
              </p>
            ) : (
              <p className="text-[13px] text-gray-300">내용 없음</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
