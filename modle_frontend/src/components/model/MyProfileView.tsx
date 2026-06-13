import { Model } from '@/types/model';
import Image from 'next/image';

interface Props {
  data: Model;
}

export function MyProfileView({ data }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-hairline p-8">
      {/* 상단 프로필 기본 정보 */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10">
        <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
          <Image
            src={data.profileImageUrl || '/images/default-avatar.png'}
            alt="프로필 이미지"
            fill
            className="object-cover rounded-full shadow-sm"
            sizes="(max-width: 768px) 128px, 160px"
          />
        </div>
        
        <div className="flex flex-col items-center md:items-start flex-grow">
          <h2 className="text-display-md text-ink font-semibold mb-2">{data.name}</h2>
          
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
            <span className="px-3 py-1 bg-surface-brand-subtle text-primary rounded-full text-sm font-medium">
              {data.gender ? '남성' : '여성'}
            </span>
            <span className="px-3 py-1 bg-surface-brand-subtle text-primary rounded-full text-sm font-medium">
              {data.age ? `${data.age}세` : '나이 미상'}
            </span>
            <span className="px-3 py-1 bg-surface-brand-subtle text-primary rounded-full text-sm font-medium">
              {data.height ? `${data.height}cm` : '키 미상'}
            </span>
            <span className="px-3 py-1 bg-surface-brand-subtle text-primary rounded-full text-sm font-medium">
              {data.weight ? `${data.weight}kg` : '몸무게 미상'}
            </span>
          </div>
          
          {data.field && (
            <p className="text-body-md text-body">
              <strong>활동 분야:</strong> {data.field}
            </p>
          )}
        </div>
      </div>

      <hr className="border-hairline mb-8" />

      {/* 자기 소개 */}
      <div className="mb-8">
        <h3 className="text-title-lg text-ink font-semibold mb-4">자기 소개</h3>
        <div className="bg-surface p-6 rounded-xl text-body-md text-body leading-relaxed whitespace-pre-wrap">
          {data.introduction || '아직 작성된 자기 소개가 없습니다.'}
        </div>
      </div>

      {/* 태그 영역 */}
      <div>
        <h3 className="text-title-lg text-ink font-semibold mb-4">내 태그</h3>
        {data.tags && data.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.tags.map((tag, index) => (
              <span 
                key={index} 
                className="px-4 py-2 bg-hairline-strong text-ink rounded-lg text-sm font-medium hover:bg-body-subtle transition-colors cursor-default"
              >
                #{tag.trim()}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-body-md text-body">등록된 태그가 없습니다.</p>
        )}
      </div>
    </div>
  );
}
