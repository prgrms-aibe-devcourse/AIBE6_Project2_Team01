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

import { AnimatePresence, motion } from 'framer-motion';

export function MyProfileContainer({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState('portfolio');

  return (
    <div className="min-h-screen bg-gray-50 pb-20 text-ink">
      <div className="border-b border-hairline bg-white shadow-[0_10px_30px_rgba(0,0,0,0.02)] pb-10 pt-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="mx-auto max-w-[1200px] px-6 relative z-10">
          <ProfileHeader data={initialData} />
        </div>
      </div>

      <div className="sticky top-0 z-20 border-b border-hairline bg-white/90 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-[1200px] px-6">
          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
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
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
