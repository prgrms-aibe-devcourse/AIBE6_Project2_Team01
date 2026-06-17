import Image from 'next/image';
import Link from 'next/link';
import { APPLICATION_STATUS_LABELS, type ApplicantInfo } from '@/lib/api/application';

interface Props {
  applicants: ApplicantInfo[];
}

export function ApplicantList({ applicants }: Props) {
  if (applicants.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-bold text-gray-400 tracking-wider uppercase">
          아직 지원자가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {applicants.map((a) => (
        <li key={a.applicationId} className="border border-gray-200 bg-white p-5">
          <Link
            href={`/models/${a.modelId}`}
            className="flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
              {a.profileImageUrl ? (
                <Image
                  src={a.profileImageUrl}
                  alt={a.modelName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg text-gray-400">
                  👤
                </div>
              )}
            </div>
            <span className="font-bold text-black text-[15px] hover:underline underline-offset-2">
              {a.modelName}
            </span>
          </Link>

          <dl className="space-y-1.5 text-[13px]">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-gray-400">지원 상태</dt>
              <dd className="font-medium text-black">
                {APPLICATION_STATUS_LABELS[a.status] ?? a.status}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-gray-400">컨택 여부</dt>
              <dd className="font-medium text-black">{a.contacted ? '✓' : '-'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-gray-400">촬영 여부</dt>
              <dd className="font-medium text-black">{a.shooting ? '✓' : '-'}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-gray-400">지원일</dt>
              <dd className="text-gray-500">
                {new Date(a.appliedDate).toLocaleDateString('ko-KR')}
              </dd>
            </div>
            {a.coverLetter && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-[12px] text-gray-500 line-clamp-3">{a.coverLetter}</p>
              </div>
            )}
          </dl>
        </li>
      ))}
    </ul>
  );
}
