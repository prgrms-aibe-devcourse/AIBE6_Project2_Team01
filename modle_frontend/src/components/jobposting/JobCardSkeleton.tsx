// JobCard와 동일한 외형의 로딩 스켈레톤. 그리드 셀 크기를 맞춰 레이아웃 시프트를 방지한다.
export function JobCardSkeleton() {
  return (
    <div className="flex h-full w-full animate-pulse flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      {/* Top: profile + title */}
      <div className="mb-4 flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-200" />
          </div>
          <div className="h-3 w-10 rounded bg-gray-200" />
        </div>
        <div className="h-4 w-4/5 rounded bg-gray-200" />
        <div className="mt-2 h-4 w-3/5 rounded bg-gray-200" />
      </div>

      {/* Middle: details */}
      <div className="mt-auto flex flex-col gap-1.5">
        <div className="h-3 w-2/3 rounded bg-gray-200" />
      </div>

      {/* Bottom: tag + date */}
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <div className="h-5 w-16 rounded bg-gray-200" />
        <div className="h-3 w-12 rounded bg-gray-200" />
      </div>
    </div>
  );
}
