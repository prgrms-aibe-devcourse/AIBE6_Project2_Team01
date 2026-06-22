import { Model } from "@/types/model";
import Image from "next/image";

interface Props {
  data: Model;
}

export function MyProfileView({ data }: Props) {
  return (
    <div className="bg-white border-t-2 border-black pt-10 text-black">
      {/* 상단 프로필 기본 정보 */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 rounded-full overflow-hidden shadow-lg border-4 border-white">
          <Image
            src={data.profileImageUrl || "/placeholder.png"}
            alt="프로필 이미지"
            fill
            className="object-cover bg-gray-50"
            sizes="(max-width: 768px) 128px, 160px"
            onError={(e) => {
              e.currentTarget.srcset = "/placeholder.png";
            }}
          />
        </div>

        <div className="flex flex-col items-center md:items-start flex-grow">
          <h2 className="text-4xl text-black font-black mb-4 tracking-tighter uppercase">
            {data.name}
          </h2>

          <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
            <span className="px-4 py-1.5 border border-hairline shadow-sm bg-white text-ink text-xs font-bold uppercase tracking-widest rounded-full">
              {data.sex === "M" ? "남성" : "여성"}
            </span>
            <span className="px-4 py-1.5 border border-hairline shadow-sm bg-white text-ink text-xs font-bold uppercase tracking-widest rounded-full">
              {data.age ? `${data.age}세` : "나이 미상"}
            </span>
            <span className="px-4 py-1.5 border border-hairline shadow-sm bg-white text-ink text-xs font-bold uppercase tracking-widest rounded-full">
              {data.height ? `${data.height}cm` : "키 미상"}
            </span>
            <span className="px-4 py-1.5 border border-hairline shadow-sm bg-white text-ink text-xs font-bold uppercase tracking-widest rounded-full">
              {data.weight ? `${data.weight}kg` : "몸무게 미상"}
            </span>
          </div>

          {data.field && (
            <p className="text-xs font-bold uppercase tracking-widest text-black mt-2">
              <span className="text-gray-500 mr-2 border-r border-black pr-2">
                활동 분야 (CATEGORY)
              </span>{" "}
              {data.field}
            </p>
          )}
        </div>
      </div>

      <hr className="border-hairline mb-8" />

      <div className="mb-12">
        <h3 className="text-xl text-black font-black mb-6 uppercase tracking-widest border-b-2 border-black pb-3">
          소개글 (ABOUT ME)
        </h3>
        <div className="bg-white border border-hairline shadow-sm p-8 text-black text-sm font-medium leading-relaxed whitespace-pre-wrap rounded-[2rem]">
          {data.introduction || "아직 작성된 자기 소개가 없습니다."}
        </div>
      </div>

      {/* 태그 영역 */}
      <div className="mb-8">
        <h3 className="text-xl text-black font-black mb-6 uppercase tracking-widest border-b-2 border-black pb-3">
          내 태그 (MY TAGS)
        </h3>
        {data.tags && data.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-1.5 bg-ink text-white text-xs font-bold uppercase tracking-widest cursor-default rounded-full shadow-sm"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm font-medium text-gray-500">
            등록된 태그가 없습니다.
          </p>
        )}
      </div>
    </div>
  );
}
