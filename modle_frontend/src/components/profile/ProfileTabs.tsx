import { motion } from 'framer-motion';

interface TabItem {
  id: string;
  label: string;
}

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs?: TabItem[];
}

const DEFAULT_TABS: TabItem[] = [
  { id: 'profile', label: '프로필' },
  { id: 'portfolio', label: '포트폴리오' },
  { id: 'applications', label: '지원한 공고' },
  { id: 'favorites', label: '즐겨찾기' },
  { id: 'career', label: '경력' },
  { id: 'reviews', label: '리뷰' },
  { id: 'contracts', label: '계약 내역' },
];

export function ProfileTabs({ activeTab, onTabChange, tabs = DEFAULT_TABS }: Props) {
  return (
    <div className="flex overflow-x-auto hide-scrollbar py-3 gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative whitespace-nowrap px-6 py-2.5 text-sm font-bold transition-colors rounded-full ${
            activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-black hover:bg-gray-100'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTabPill"
              className="absolute inset-0 bg-ink rounded-full"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
