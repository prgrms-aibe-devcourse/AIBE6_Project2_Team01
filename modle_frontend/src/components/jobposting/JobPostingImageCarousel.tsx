"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

type Props = {
  imageUrls: string[];
};

export function JobPostingImageCarousel({ imageUrls }: Props) {
  const [index, setIndex] = useState(0);

  if (!imageUrls || imageUrls.length === 0) return null;

  const total = imageUrls.length;
  const goPrev = () => setIndex((cur) => (cur - 1 + total) % total);
  const goNext = () => setIndex((cur) => (cur + 1) % total);

  return (
    <div className="mt-8 border-t border-hairline pt-6">

      <div className="relative mt-4 flex h-[480px] items-center justify-center overflow-hidden rounded-xl border border-hairline bg-canvas-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrls[index]}
          alt={`공고 이미지 ${index + 1}`}
          className="max-h-full max-w-full object-contain"
        />

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="이전 이미지"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface/90 text-ink shadow-sm backdrop-blur transition hover:border-hairline-strong hover:bg-surface"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="다음 이미지"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-hairline bg-surface/90 text-ink shadow-sm backdrop-blur transition hover:border-hairline-strong hover:bg-surface"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="absolute right-3 top-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-body shadow-sm backdrop-blur">
              {index + 1} / {total}
            </span>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {imageUrls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번 이미지로 이동`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-primary" : "w-1.5 bg-hairline-strong hover:bg-mute"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
