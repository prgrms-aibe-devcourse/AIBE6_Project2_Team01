"use client";

import { authenticatedFetch, API_BASE_URL, client } from "@/lib/api/client";
import {
  AiGenerateParams,
  Category,
  JobPostingForm,
  type JobPostingFormState,
} from "@/components/jobposting/JobPostingForm";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "HAIR", label: "헤어" },
  { value: "MAKEUP", label: "메이크업" },
  { value: "FITTING", label: "피팅" },
  { value: "HAND", label: "핸드" },
  { value: "FOOD", label: "음식" },
  { value: "PRODUCT", label: "제품" },
  { value: "ETC", label: "기타" },
];

export default function NewJobPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [templateCategory, setTemplateCategory] = useState<Category | "">("");

  useEffect(() => {
    if (!isLoading && user?.role !== "CLIENT") {
      router.replace("/jobs");
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.role !== "CLIENT") {
    return <main className="min-h-screen bg-canvas" />;
  }

  const handleTemplateCategory = (value: Category) => {
    setTemplateCategory((cur) => (cur === value ? "" : value));
  };

  const handleAiGenerate = async (params: AiGenerateParams): Promise<string> => {
    const res = await authenticatedFetch(
      `${API_BASE_URL}/api/v1/jobs/templates/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      },
    );
    if (!res.ok) throw new Error("AI 본문 생성에 실패했습니다.");
    const json = await res.json();
    return json.data?.content ?? "";
  };

  const handleSubmit = async (formData: JobPostingFormState) => {
    const requestBody = {
        title: formData.title,
        content: formData.content,
        category: formData.category as
          | "HAIR"
          | "MAKEUP"
          | "FITTING"
          | "HAND"
          | "FOOD"
          | "PRODUCT"
          | "ETC",
        region: formData.region as
          | "SEOUL"
          | "BUSAN"
          | "DAEGU"
          | "INCHEON"
          | "GWANGJU"
          | "DAEJEON"
          | "ULSAN"
          | "SEJONG"
          | "GYEONGGI"
          | "GANGWON"
          | "CHUNGBUK"
          | "CHUNGNAM"
          | "JEONBUK"
          | "JEONNAM"
          | "GYEONGBUK"
          | "GYEONGNAM"
          | "JEJU",
        requiredSex: formData.requiredSex,
        requiredCount: formData.requiredCount
          ? Number(formData.requiredCount)
          : undefined,
        ageMin: formData.ageMin ? Number(formData.ageMin) : undefined,
        ageMax: formData.ageMax ? Number(formData.ageMax) : undefined,
        heightMin: formData.heightMin ? Number(formData.heightMin) : undefined,
        heightMax: formData.heightMax ? Number(formData.heightMax) : undefined,
        weightMin: formData.weightMin ? Number(formData.weightMin) : undefined,
        weightMax: formData.weightMax ? Number(formData.weightMax) : undefined,
        minCareerMonths: formData.minCareerMonths
          ? Number(formData.minCareerMonths)
          : undefined,
        payment: formData.payment ? Number(formData.payment) : undefined,
        payType: formData.payType as "CASH" | "SERVICE" | "FREE",
        serviceDetail: formData.serviceDetail || undefined,
        shootDate: formData.shootDate
          ? `${formData.shootDate}T00:00:00`
          : undefined,
        imageUrls: formData.imageUrls,
    };

    const { response, data } = await client.POST("/api/v1/jobs", {
      body: requestBody,
    });

    if (!response.ok) {
      throw new Error("공고 등록에 실패했습니다.");
    }

    const id = data?.data?.id;
    router.push(`/jobs/${id}`);
  };

  return (
    <main className="min-h-screen bg-canvas text-ink">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-hairline pb-6">
          <div className="mt-3">
            <h1 className="text-[28px] font-bold leading-9 text-ink">
              공고 등록
            </h1>
            <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-body">
              모집 공고를 작성하세요. 등록 즉시 모집 중 상태로 공개됩니다.
            </p>
          </div>
        </header>

        {/* AI 본문 템플릿 카테고리 선택 */}
        <section className="rounded-xl border border-hairline bg-surface p-6">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[15px] font-semibold leading-6 text-ink">
              AI 본문 템플릿
            </h2>
            <span className="text-[13px] text-mute">(선택)</span>
          </div>
          <p className="mt-1 text-[13px] leading-5 text-mute">
            카테고리를 선택하면 필수 정보 입력 후 AI로 공고 본문을 자동 생성할 수 있습니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => handleTemplateCategory(o.value)}
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold leading-5 transition ${
                  templateCategory === o.value
                    ? "border-primary bg-primary text-on-primary"
                    : "border-hairline bg-surface text-body hover:border-hairline-strong"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
          {templateCategory ? (
            <p className="mt-3 text-[12px] leading-5 text-mute">
              선택된 카테고리를 다시 누르면 AI 템플릿이 해제되고 본문을 직접 작성할 수 있습니다.
            </p>
          ) : null}
        </section>

        <JobPostingForm
          externalCategory={templateCategory}
          onAiGenerate={templateCategory ? handleAiGenerate : undefined}
          onSubmit={handleSubmit}
          submitLabel="공고 등록"
        />
      </div>
    </main>
  );
}
