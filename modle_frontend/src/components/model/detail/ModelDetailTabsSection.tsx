"use client";

import { useState } from "react";
import { DetailLookbook } from "@/components/model/detail/DetailLookbook";
import { ModelCareerSection } from "@/components/model/detail/ModelCareerSection";
import { ReviewList } from "@/components/review/ReviewList";
import { useAuth } from "@/hooks/useAuth";
import type { Portfolio } from "@/types/model";

interface Props {
  portfolios: Portfolio[];
  modelId: number;
  modelUserId: number;
  reviewCount: number;
}

type Tab = "info" | "review" | "career";

export function ModelDetailTabsSection({ portfolios, modelId, modelUserId, reviewCount }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("info");
  const { user } = useAuth();
  const isClient = user?.role === "CLIENT";

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
        <button onClick={() => setActiveTab("info")} className={tabClass("info")}>
          상세정보
        </button>
        <button onClick={() => setActiveTab("review")} className={tabClass("review")}>
          리뷰 ({reviewCount})
        </button>
        {isClient && (
          <button onClick={() => setActiveTab("career")} className={tabClass("career")}>
            경력 사항
          </button>
        )}
      </div>

      <div className="flex w-full flex-col gap-4 pb-20 pt-8 md:mt-12 md:gap-8">
        {activeTab === "info" && <DetailLookbook portfolios={portfolios} />}
        {activeTab === "review" && (
          <ReviewList targetUserId={modelUserId} totalCount={reviewCount} />
        )}
        {activeTab === "career" && isClient && (
          <ModelCareerSection modelId={modelId} />
        )}
      </div>
    </div>
  );
}
