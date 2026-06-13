import { Model } from '@/types/model';
import Image from 'next/image';
import Link from 'next/link';

interface Props {
  data: Model;
}

export function ProfileHeader({ data }: Props) {
  // Use dummy reviews since it's missing from backend Model
  const reviewScore = data.rating || 4.8;
  const reviewCount = data.reviewCount || 124;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
      {/* Profile Image with Pencil Overlay */}
      <div className="relative w-36 h-36 shrink-0">
        <Image
          src={data.profileImageUrl || '/images/default-avatar.png'}
          alt="Profile Image"
          fill
          className="object-cover rounded-full border-4 border-white shadow-sm bg-white"
          onError={(e) => {
            e.currentTarget.srcset = '/images/default-avatar.png';
          }}
        />
        <Link href="/my/profile/edit">
          <div className="absolute bottom-2 right-2 w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Profile Info */}
      <div className="flex-grow flex flex-col items-center md:items-start">
        <div className="flex flex-col md:flex-row md:items-end gap-3 mb-3">
          <h1 className="text-display-md text-ink font-bold">{data.name}</h1>
          <div className="flex items-center gap-1 text-body-md text-body">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{data.region || '서울, 대한민국'}</span>
          </div>
          <div className="flex items-center gap-1 ml-0 md:ml-2 bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-sm font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {reviewScore} ({reviewCount} reviews)
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
          {(data.tags && data.tags.length > 0 ? data.tags : ['#패션', '#피팅', '#광고']).map((tag, idx) => (
            <span key={idx} className="px-3 py-1 bg-surface-brand-subtle text-ink font-medium text-sm rounded-full cursor-default">
              {tag.startsWith('#') ? tag : `#${tag.trim()}`}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/my/profile/edit" className="flex-1 md:flex-none">
            <button className="w-full px-6 py-2 bg-[#0B1221] hover:bg-[#1a2333] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              프로필 수정
            </button>
          </Link>
          <button className="flex-1 md:flex-none px-6 py-2 bg-white border border-hairline hover:bg-surface text-ink text-sm font-medium rounded-lg transition-colors shadow-sm">
            포트폴리오 공유
          </button>
        </div>
      </div>
    </div>
  );
}
