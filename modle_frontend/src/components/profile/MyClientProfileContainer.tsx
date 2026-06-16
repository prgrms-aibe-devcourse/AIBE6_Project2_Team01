'use client';

import { ClientProfileInfo } from '@/components/profile/ClientProfileInfo';
import { ClientProfileHeader } from '@/components/profile/ClientProfileHeader';
import { BookmarkedModels } from '@/components/profile/BookmarkedModels';
import { ProfileTabs } from '@/components/profile/ProfileTabs';
import { Client } from '@/types/client';
import { useState } from 'react';

interface Props {
  initialData: Client;
}

export function MyClientProfileContainer({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState('profile');

  const CLIENT_TABS = [
    { id: 'profile', label: '의뢰인 정보' },
    { id: 'jobs', label: '등록한 공고' },
    { id: 'favorites', label: '관심 모델' },
    { id: 'contracts', label: '계약 내역' },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 text-black">
      {/* 1. 상단 배너 및 프로필 헤더 */}
      <div className="bg-white pt-12 pb-8 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto px-6">
          <ClientProfileHeader data={initialData} />
        </div>
      </div>

      {/* 2. 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-300 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} tabs={CLIENT_TABS} />
        </div>
      </div>

      {/* 3. 메인 컨텐츠 영역 */}
      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {activeTab === 'profile' && <ClientProfileInfo data={initialData} />}
        {activeTab === 'favorites' && <BookmarkedModels />}

        {/* 임시 처리 (나머지 탭) */}
        {['jobs', 'contracts'].includes(activeTab) && (
          <div className="py-20 text-center text-sm text-gray-500">
            아직 준비 중인 탭입니다.
          </div>
        )}
      </div>
    </div>
  );
}
