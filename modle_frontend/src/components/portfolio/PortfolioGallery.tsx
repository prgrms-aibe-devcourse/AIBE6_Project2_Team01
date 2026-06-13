'use client';

import { deletePortfolioImage } from '@/lib/api/portfolio';
import { Portfolio } from '@/types/model';
import Image from 'next/image';
import { useState } from 'react';
import { PortfolioUploadModal } from './PortfolioUploadModal';

interface Props {
  modelId: number;
  initialPortfolios?: Portfolio[]; // 백엔드에서 받아온 초기 사진들
}

export function PortfolioGallery({ modelId, initialPortfolios = [] }: Props) {
  // 화면에 보여줄 사진 목록 상태
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // [삭제 로직]
  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 사진을 삭제하시겠습니까?')) return;

    try {
      // 1. 백엔드에 삭제 요청
      await deletePortfolioImage(id);
      
      // 2. 화면에서 해당 사진 제거
      setPortfolios(prev => prev.filter(p => p.id !== id));
      alert('삭제되었습니다.');
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-6 border-b border-black pb-4 text-black">
        <div>
          <h2 className="text-xl font-black text-black mb-1 uppercase tracking-widest">나의 포트폴리오</h2>
          <p className="text-xs text-gray-500 tracking-wide">업로드된 {portfolios.length}개의 작품</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2 bg-black border border-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          포트폴리오 업로드
        </button>
      </div>

      {/* Grid: 진짜 데이터 렌더링 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
        {portfolios.map((item) => (
          <div key={item.id} className="relative aspect-[3/4] rounded-none overflow-hidden group bg-gray-50 border border-gray-200">
            <Image
              src={item.imgUrl}
              alt={`포트폴리오 ${item.id}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* 오버레이 */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
              <button 
                onClick={() => handleDelete(item.id)}
                className="w-10 h-10 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-colors" 
                title="삭제하기"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
        {portfolios.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-400 font-medium tracking-wide">
            등록된 포트폴리오가 없습니다.
          </div>
        )}
      </div>

      <PortfolioUploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newPortfolios) => {
          setPortfolios(prev => [...prev, ...newPortfolios]);
          alert('포트폴리오 업로드가 완료되었습니다.');
        }}
      />
    </div>
  );
}
