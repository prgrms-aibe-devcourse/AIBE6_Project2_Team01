"use client";

import { useEffect, useState } from "react";
import { getPublicCareer, type CareerItem } from "@/lib/api/career";
import { REGION_OPTIONS } from "@/lib/constants/region";

const REGION_LABELS = Object.fromEntries(REGION_OPTIONS.map((o) => [o.value, o.label]));

const CATEGORY_LABELS: Record<string, string> = {
  HAIR: "헤어",
  MAKEUP: "메이크업",
  CLOTHING: "의류",
  FITTING: "피팅",
  HAND: "핸드",
  FOOD: "음식",
  PRODUCT: "제품",
  ETC: "기타",
};

interface Props {
  modelId: number;
}

export function ModelCareerSection({ modelId }: Props) {
  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicCareer(modelId)
      .then(setCareers)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [modelId]);

  if (isLoading) {
    return <div className="py-10 text-center text-sm text-gray-400">로딩 중...</div>;
  }

  if (careers.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">공개된 경력이 없습니다.</div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {careers.map((career) => (
        <li key={career.id} className="border border-gray-200 bg-white p-4">
          <h4 className="mb-2 line-clamp-2 text-[14px] font-bold text-black">{career.title}</h4>
          <dl className="space-y-1 text-[13px]">
            <div className="flex gap-2">
              <dt className="w-16 text-gray-400">카테고리</dt>
              <dd className="font-medium text-black">
                {CATEGORY_LABELS[career.category] ?? career.category}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 text-gray-400">지역</dt>
              <dd className="font-medium text-black">
                {REGION_LABELS[career.region] ?? career.region}
              </dd>
            </div>
            {career.shootDate && (
              <div className="flex gap-2">
                <dt className="w-16 text-gray-400">촬영일</dt>
                <dd className="text-gray-500">
                  {new Date(career.shootDate).toLocaleDateString("ko-KR")}
                </dd>
              </div>
            )}
            {career.completedDate && (
              <div className="flex gap-2">
                <dt className="w-16 text-gray-400">완료일</dt>
                <dd className="text-gray-500">
                  {new Date(career.completedDate).toLocaleDateString("ko-KR")}
                </dd>
              </div>
            )}
          </dl>
        </li>
      ))}
    </ul>
  );
}
