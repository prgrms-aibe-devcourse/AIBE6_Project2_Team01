'use client';

import { useState } from 'react';

import { BookmarkedModels } from '@/components/profile/BookmarkedModels';
import { ClientProfileHeader } from '@/components/profile/ClientProfileHeader';
import { ClientProfileInfo } from '@/components/profile/ClientProfileInfo';
import { MyContracts } from '@/components/profile/MyContracts';
import { MyJobPostings } from '@/components/profile/MyJobPostings';
import { ReviewList } from '@/components/review/ReviewList';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { Client } from '@/types/client';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  initialData: Client;
}

export function MyClientProfileContainer({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuth();

  const CLIENT_TABS = [
    { id: 'profile', label: '의뢰인 정보' },
    { id: 'jobs', label: '등록한 공고' },
    { id: 'favorites', label: '관심 모델' },
    { id: 'reviews', label: '리뷰' },
    { id: 'contracts', label: '계약 내역' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 text-black">
      <div className="border-b border-gray-200 bg-white pb-8 pt-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <ClientProfileHeader data={initialData} />
        </div>
      </div>

      <div className="sticky top-0 z-10 border-b border-gray-300 bg-white">
        <div className="mx-auto max-w-[1200px] px-6">
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={CLIENT_TABS}
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10">
        {activeTab === 'profile' && <ClientProfileInfo data={initialData} />}
        {activeTab === 'favorites' && <BookmarkedModels />}
        {activeTab === 'jobs' && <MyJobPostings />}
        {activeTab === 'reviews' && user?.id && (
          <ReviewList targetUserId={user.id} totalCount={initialData.reviewCount} />
        )}

        {activeTab === 'contracts' && <MyContracts viewer="CLIENT" />}
      </div>
    </div>
  );
}
