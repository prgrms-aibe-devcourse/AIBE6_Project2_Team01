import { Client } from '@/types/client';
import Image from 'next/image';
import { getRegionLabel } from '@/lib/constants/region';
import Link from 'next/link';

interface Props {
  data: Client;
}

export function ClientProfileHeader({ data }: Props) {
  // Use dummy reviews since it's missing from backend
  const reviewScore = data.avgRating || 0.0;
  const reviewCount = data.reviewCount || 0;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-8 mb-8 text-black">
      {/* Profile Image with Pencil Overlay */}
      <div className="relative w-36 h-36 shrink-0">
        <Image
          src={data.profileImageUrl || '/placeholder.png'}
          alt="Profile Image"
          fill
          className="object-cover border border-gray-200 bg-gray-50"
          onError={(e) => {
            e.currentTarget.srcset = '/placeholder.png';
          }}
        />
      </div>

      {/* Profile Info */}
      <div className="flex-grow flex flex-col items-center md:items-start">
        <div className="flex flex-col md:flex-row md:items-end gap-3 mb-3">
          <h1 className="text-5xl text-black font-black uppercase tracking-tighter">{data.companyName}</h1>
          <div className="flex items-center gap-1">
            <span className="text-gray-400">📍</span>
            <span>{getRegionLabel(data.region)}</span>
          </div>
          <div className="flex items-center gap-1 ml-0 md:ml-4 bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest border border-black">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {reviewScore} ({reviewCount} reviews)
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full md:w-auto mt-4">
          <Link href="/my/profile/edit" className="flex-1 md:flex-none">
            <button className="w-full px-8 py-3 bg-black hover:bg-gray-900 text-white text-xs font-bold tracking-widest uppercase transition-colors border border-black">
              프로필 편집
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
