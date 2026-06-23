import { ClientProposalButton } from "@/components/message/ClientProposalButton";
import { ModelDetailTabsSection } from "@/components/model/detail/ModelDetailTabsSection";
import { ProfileGallery } from "@/components/model/detail/ProfileGallery";
import { ModelBookmarkButton } from "@/components/ui/ModelBookmarkButton";
import { ReportButton } from "@/components/ui/ReportButton";
import { getModel } from "@/lib/api/model";
import { getRegionLabel } from "@/lib/constants/region";
import { getCategoryLabel } from "@/lib/constants/category";
import { notFound } from "next/navigation";

export const metadata = {
  title: "모델 상세 | 모들",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModelDetailPage({ params }: PageProps) {
  const { id } = await params;

  let modelData;
  try {
    modelData = await getModel(id);
  } catch {
    notFound();
  }

  return (
    <main className="w-full bg-white text-black pb-32 font-sans selection:bg-black selection:text-white">
      <div className="max-w-[1000px] mx-auto px-4 md:px-6 pt-6 md:pt-10">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          <div className="w-full md:w-[45%] lg:w-[40%] max-w-[450px] mx-auto md:mx-0">
            <ProfileGallery
              portfolios={modelData.portfolios || []}
              mainFallback={modelData.profileImageUrl || "/placeholder.png"}
            />
          </div>

          <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col">
            <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-widest cursor-default w-fit">
              {modelData.categories && modelData.categories.length > 0
                ? modelData.categories.map(c => getCategoryLabel(c)).join(" / ")
                : "KOREAN MODEL"}
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-ink mt-2 mb-4 tracking-tight">
              {modelData.name}
              <span className="font-medium text-gray-400 text-xl ml-3 align-middle">
                ({modelData.sex === "M" ? "남성" : "여성"})
              </span>
            </h1>

            <div className="flex items-center gap-4 text-sm font-medium border-b border-hairline/50 pb-6 mb-8">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full">
                <span className="text-yellow-400 text-lg">★</span>
                <span className="text-ink font-bold">
                  {modelData.rating?.toFixed(1) || "0.0"}
                </span>
              </div>
              <div className="w-px h-4 bg-hairline-strong"></div>
              <span className="text-body cursor-default">
                후기 <span className="font-bold">{modelData.reviewCount || 0}</span>개
              </span>
            </div>

            <div className="flex flex-col gap-4 text-[15px] tracking-wide bg-gray-50/50 p-6 rounded-2xl border border-hairline/50">
              <div className="flex items-center">
                <span className="w-28 text-gray-500 font-medium">활동 지역</span>
                <span className="text-ink font-bold">
                  {getRegionLabel(modelData.region)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-gray-500 font-medium">나이</span>
                <span className="text-ink font-bold">
                  {modelData.age ? `${modelData.age}세` : "미상"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-gray-500 font-medium">신체 사이즈</span>
                <span className="text-ink font-bold flex gap-3">
                  <span>{modelData.height ? `${modelData.height} cm` : "미상"}</span>
                  <span className="text-gray-300">|</span>
                  <span>{modelData.weight ? `${modelData.weight} kg` : "미상"}</span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-gray-500 font-medium">상세 사이즈</span>
                <span className="text-ink font-bold flex gap-3">
                  <span>상의 {modelData.topSize || "미상"}</span>
                  <span className="text-gray-300">|</span>
                  <span>하의 {modelData.bottomSize || "미상"}</span>
                  <span className="text-gray-300">|</span>
                  <span>발 {modelData.shoeSize ? `${modelData.shoeSize} mm` : "미상"}</span>
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-gray-500 font-medium">경력</span>
                <span className="text-ink font-bold">
                  {modelData.experience === 0 ? "신입" : modelData.experience ? `${modelData.experience}년` : "미상"}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-28 text-gray-500 font-medium">촬영 가능 요일</span>
                <span className="text-ink font-bold">
                  {modelData.availableDays || "무관"}
                </span>
              </div>
              <div className="flex items-start mt-2 pt-4 border-t border-hairline/50">
                <span className="w-28 text-gray-500 font-medium mt-1.5">관련 태그</span>
                <div className="flex flex-wrap gap-2 flex-1">
                  {modelData.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="bg-white border border-hairline text-ink px-3 py-1 text-xs font-semibold rounded-full shadow-sm cursor-default"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-hairline text-body leading-relaxed whitespace-pre-wrap text-[15px]">
              {modelData.introduction || "작성된 모델 소개글이 없습니다."}
            </div>

            <div className="mt-10 md:mt-auto pt-8 flex gap-3">
              <ModelBookmarkButton
                modelId={modelData.id}
                className="flex-[1] bg-white border border-hairline-strong hover:border-ink hover:shadow-md text-ink font-bold py-4 rounded-xl text-center transition-all hover:-translate-y-1 disabled:opacity-50"
              />
              <ClientProposalButton
                recipientUserId={modelData.userId}
                className="flex-[2] bg-ink hover:bg-ink/90 text-white font-bold py-4 rounded-xl text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              />
              <ReportButton
                targetType="PROFILE"
                targetId={modelData.userId}
                className="px-4 bg-white border border-hairline hover:border-red-400 hover:text-red-500 hover:shadow-sm text-gray-400 text-sm font-bold py-4 rounded-xl text-center transition-all"
              />
            </div>
          </div>
        </div>

        <ModelDetailTabsSection
          portfolios={modelData.portfolios || []}
          modelId={modelData.id}
          modelUserId={modelData.userId}
          reviewCount={modelData.reviewCount || 0}
        />
      </div>
    </main>
  );
}
