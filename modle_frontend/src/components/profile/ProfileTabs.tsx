interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function ProfileTabs({ activeTab, onTabChange }: Props) {
  const tabs = [
    { id: 'profile', label: '프로필' },
    { id: 'portfolio', label: '포트폴리오' },
    { id: 'applications', label: '지원한 공고' },
    { id: 'favorites', label: '즐겨찾기' },
    { id: 'contracts', label: '계약 내역' },
  ];

  return (
    <div className="flex overflow-x-auto hide-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`whitespace-nowrap px-6 py-4 text-sm font-semibold transition-colors relative ${
            activeTab === tab.id ? 'text-black' : 'text-gray-500 hover:text-black'
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />
          )}
        </button>
      ))}
    </div>
  );
}
