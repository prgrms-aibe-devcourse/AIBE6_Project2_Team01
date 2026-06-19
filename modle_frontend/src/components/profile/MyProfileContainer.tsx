'use client';

import { useState } from 'react';

import { MyProfileView } from '@/components/model/MyProfileView';
import { PortfolioGallery } from '@/components/portfolio/PortfolioGallery';
import { BookmarkedJobs } from '@/components/profile/BookmarkedJobs';
import { MyApplications } from '@/components/profile/MyApplications';
import { MyContracts } from '@/components/profile/MyContracts';
import { MyCareerList } from '@/components/profile/MyCareerList';
import { ReviewList } from '@/components/review/ReviewList';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { Model } from '@/types/model';

interface Props {
  initialData: Model;
}

export function MyProfileContainer({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 text-black">
      <div className="border-b border-gray-200 bg-white pb-8 pt-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <ProfileHeader data={initialData} />
        </div>
      </div>

      <div className="sticky top-0 z-10 border-b border-gray-300 bg-white">
        <div className="mx-auto max-w-[1200px] px-6">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10">
        {activeTab === 'profile' && <MyProfileView data={initialData} />}
        {activeTab === 'portfolio' && (
          <PortfolioGallery
            modelId={initialData.id}
            initialPortfolios={initialData.portfolios}
          />
        )}
        {activeTab === 'favorites' && <BookmarkedJobs />}
        {activeTab === 'applications' && <MyApplications />}
        {activeTab === 'career' && <MyCareerList />}
        {activeTab === 'reviews' && initialData.userId && (
          <ReviewList targetUserId={initialData.userId} totalCount={initialData.reviewCount} />
        )}

        {activeTab === 'contracts' && <MyContracts viewer="MODEL" />}
      </div>
    </div>
  );
}
