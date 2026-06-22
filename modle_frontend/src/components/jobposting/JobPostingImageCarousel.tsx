"use client";

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
    <div className="mt-6 border-t border-hairline pt-6">
      <div className="relative overflow-hidden rounded-lg border border-hairline bg-canvas-soft">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrls[index]}
          alt={`공고 이미지 ${index + 1}`}
          className="mx-auto max-h-[600px] w-auto object-contain"
        />

        {total > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="이전 이미지"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-white transition hover:bg-ink/80"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="다음 이미지"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-ink/60 text-white transition hover:bg-ink/80"
            >
              ›
            </button>
            <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ink/60 px-3 py-1 text-[12px] font-semibold text-white">
              {index + 1} / {total}
            </span>
          </>
        ) : null}
      </div>

      {total > 1 ? (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {imageUrls.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}번 이미지로 이동`}
              className={`h-2 w-2 rounded-full transition ${
                i === index ? "bg-primary" : "bg-hairline-strong"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
