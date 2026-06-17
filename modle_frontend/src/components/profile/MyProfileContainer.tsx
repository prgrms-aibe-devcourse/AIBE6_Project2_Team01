'use client';

import { MyProfileView } from '@/components/model/MyProfileView';
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery';
import { BookmarkedJobs } from '@/components/profile/BookmarkedJobs';
import { MyApplications } from '@/components/profile/MyApplications';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { Model } from '@/types/model';
import { useState } from 'react';

interface Props {
  initialData: Model;
}

export function MyProfileContainer({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState('portfolio'); // 목업처럼 포트폴리오를 기본으로

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 text-black">
      {/* 1. 상단 배너 및 프로필 헤더 */}
      <div className="bg-white pt-12 pb-8 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <ProfileHeader data={initialData} />
        </div>
      </div>

      {/* 2. 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-300 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      {/* 3. 메인 컨텐츠 영역 */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {activeTab === 'profile' && <MyProfileView data={initialData} />}
        {activeTab === 'portfolio' && <PortfolioGallery modelId={initialData.id} initialPortfolios={initialData.portfolios} />}
        {activeTab === 'favorites' && <BookmarkedJobs />}

        {activeTab === 'applications' && <MyApplications />}

        {/* 임시 처리 (나머지 탭) */}
        {['contracts'].includes(activeTab) && (
          <div className="py-20 text-center text-sm text-gray-500">
            아직 준비 중인 탭입니다.
          </div>
        )}
      </div>
    </div>
  );
}
