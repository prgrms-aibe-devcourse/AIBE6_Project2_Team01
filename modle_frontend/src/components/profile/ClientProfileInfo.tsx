import { Client } from '@/types/client';
import Image from 'next/image';
import { getRegionLabel } from '@/lib/constants/region';

interface Props {
  data: Client;
}

export function ClientProfileInfo({ data }: Props) {
  return (
    <div className="bg-white border-t-2 border-black pt-10 text-black">
      {/* 상단 프로필 기본 정보 */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
          <Image
            src={data.profileImageUrl || '/placeholder.png'}
            alt="프로필 이미지"
            fill
            className="object-cover border border-gray-200 bg-gray-50"
            sizes="(max-width: 768px) 128px, 160px"
            onError={(e) => {
              e.currentTarget.srcset = '/placeholder.png';
            }}
          />
        </div>
        
        <div className="flex flex-col items-center md:items-start flex-grow">
          <h2 className="text-4xl text-black font-black mb-4 tracking-tighter uppercase">{data.companyName}</h2>
          
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-6">
            <span className="px-4 py-1 border border-black bg-white text-black text-xs font-bold uppercase tracking-widest">
              {data.clientType === 'INDIVIDUAL' ? '개인' : '기업'}
            </span>

            <span className="px-4 py-1 border border-black bg-white text-black text-xs font-bold uppercase tracking-widest">
              {getRegionLabel(data.region)}
            </span>
          </div>
        </div>
      </div>

      <hr className="border-hairline mb-8" />

      <div className="mb-12">
        <h3 className="text-xl text-black font-black mb-6 uppercase tracking-widest border-b-2 border-black pb-3">소개글 (ABOUT US)</h3>
        <div className="bg-white border border-gray-200 p-8 text-black text-sm font-medium leading-relaxed whitespace-pre-wrap">
          {data.introduction || '아직 작성된 소개글이 없습니다.'}
        </div>
      </div>
    </div>
  );
}
