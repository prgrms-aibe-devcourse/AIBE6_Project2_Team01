"use client";

import { useState } from "react";
import { ReviewList } from "@/components/review/ReviewList";

interface Props {
  clientUserId: number;
  reviewCount: number;
  introduction: string;
}

type Tab = "intro" | "review" | "jobs";

export function ClientDetailTabsSection({ clientUserId, reviewCount, introduction }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("intro");

  function tabClass(tab: Tab) {
    return `flex-1 cursor-pointer py-4 text-center transition-colors border-b-[3px] ${
      activeTab === tab
        ? "border-black font-bold text-black"
        : "border-transparent font-medium text-gray-400 hover:text-black"
    }`;
  }

  return (
    <div className="mt-20 md:mt-24">
      <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-white">
        <button onClick={() => setActiveTab("intro")} className={tabClass("intro")}>
          기업 소개
        </button>
        <button onClick={() => setActiveTab("review")} className={tabClass("review")}>
          리뷰 ({reviewCount})
        </button>
        <button onClick={() => setActiveTab("jobs")} className={tabClass("jobs")}>
          진행 중인 공고
        </button>
      </div>

      <div className="mx-auto max-w-[800px] pb-20 pt-10">
        {activeTab === "intro" && (
          <div className="border border-gray-100 bg-gray-50 p-8 text-sm font-medium leading-loose text-gray-800 whitespace-pre-wrap md:text-base">
            {introduction || "작성된 기업 소개글이 없습니다."}
          </div>
        )}
        {activeTab === "review" && (
          <ReviewList targetUserId={clientUserId} totalCount={reviewCount} />
        )}
        {activeTab === "jobs" && (
          <div className="py-16 text-center text-sm text-gray-400">
            아직 준비 중인 탭입니다.
          </div>
        )}
      </div>
    </div>
  );
}
