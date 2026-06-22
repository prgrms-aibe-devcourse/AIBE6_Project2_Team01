import { JobListItem } from "@/types/job";
import { getRegionLabel } from "@/lib/constants/region";
import Link from "next/link";

interface JobCardProps {
  job: JobListItem;
}

export function JobCard({ job }: JobCardProps) {
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
              {job.category} <span className="mx-1.5 text-gray-300">|</span>{" "}
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
            <button className="text-gray-300 group-hover:text-yellow-400 transition-colors" aria-label="스크랩">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
