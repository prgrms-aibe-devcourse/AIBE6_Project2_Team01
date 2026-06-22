import { JobListItem } from "@/types/job";
import { getRegionLabel } from "@/lib/constants/region";
import { getCategoryLabel } from "@/lib/constants/category";
import Link from "next/link";

interface JobCardProps {
  job: JobListItem;
  isFavorited?: boolean;
  onToggleFavorite?: (e: React.MouseEvent, id: number) => void;
}

export function JobCard({ job, isFavorited, onToggleFavorite }: JobCardProps) {
  // Mock company data if not provided
  const companyName = "모들 파트너스";
  const profileImageUrl = "/placeholder.png";

  return (
    <Link href={`/jobs/${job.id}`} className="block h-full w-full group">
      <div className="flex flex-col h-full p-6 rounded-2xl bg-white border border-gray-200 shadow-sm transition-all duration-300 group-hover:border-gray-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] group-hover:-translate-y-1">
        {/* Top section: Profile and Title */}
        <div className="flex flex-col mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-gray-100 overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <span className="text-[13px] font-bold text-gray-600 truncate">{companyName}</span>
            </div>
            <span className="text-[11px] font-bold text-gray-400">
              {job.status === "RECRUITING" ? "모집중" : job.status}
            </span>
          </div>
          <h3 className="text-[17px] font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
            {job.title}
          </h3>
        </div>

        {/* Middle section: Details */}
        <div className="mt-auto flex flex-col gap-1.5 text-[13px] text-gray-500 font-medium">
          <div className="flex items-center">
            <span className="truncate">
              {getRegionLabel(job.region)} <span className="mx-1.5 text-gray-300">|</span>{" "}
              {getCategoryLabel(job.category)} <span className="mx-1.5 text-gray-300">|</span>{" "}
              {job.requiredSex === "M" ? "남성" : job.requiredSex === "F" ? "여성" : "성별무관"}
            </span>
          </div>
        </div>

        {/* Bottom section: Tags and Bookmark */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
          <span className="inline-flex items-center px-2 py-1 rounded bg-yellow-50 text-yellow-800 text-[11px] font-bold">
            {job.payType === "FREE"
              ? "무료"
              : job.payType === "SERVICE"
              ? "상호무페이"
              : job.payment
              ? `${Number(job.payment).toLocaleString()}원`
              : "협의"}
          </span>

          <div className="flex items-center gap-2 text-[12px] text-gray-400 font-medium">
            <span>~{job.shootDate ? new Date(job.shootDate).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) : "미정"}</span>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => onToggleFavorite(e, job.id!)}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all active:scale-90 ${
                  isFavorited
                    ? "border-red-200 bg-red-50 text-red-500"
                    : "border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                }`}
                aria-label="즐겨찾기"
              >
                <svg className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
