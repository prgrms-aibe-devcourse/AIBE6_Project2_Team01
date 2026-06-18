'use client';

import { deletePortfolioImage, reorderPortfolioImages } from '@/lib/api/portfolio';
import { Portfolio } from '@/types/model';
import { useState } from 'react';
import { PortfolioUploadModal } from './PortfolioUploadModal';
import { SortablePortfolioItem } from './SortablePortfolioItem';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

interface Props {
  modelId: number;
  initialPortfolios?: Portfolio[]; // 백엔드에서 받아온 초기 사진들
}

export function PortfolioGallery({ modelId, initialPortfolios = [] }: Props) {
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const INITIAL_COUNT = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  // [삭제 로직]
  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 사진을 삭제하시겠습니까?')) return;

    try {
      await deletePortfolioImage(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
      alert('삭제되었습니다.');
    } catch {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = portfolios.findIndex((p) => p.id === active.id);
      const newIndex = portfolios.findIndex((p) => p.id === over.id);
      
      const newPortfolios = arrayMove(portfolios, oldIndex, newIndex);
      setPortfolios(newPortfolios); // UI 즉시 반영 (Optimistic UI)
      
      try {
        await reorderPortfolioImages(newPortfolios.map(p => p.id));
      } catch {
        alert('순서 저장에 실패했습니다.');
        setPortfolios(portfolios); // 실패 시 롤백
      }
    }
  };

  // 최신순 정렬 (id 기준 역순) -> 백엔드에서 순서 적용이 되면 DB 정렬에 따르는게 맞지만 
  // 현재는 초기 불러올때 id역순(또는 displayOrder)으로 받았다고 가정하고 프론트엔드에서는 배열 순서 그대로 렌더링
  const displayedPortfolios = portfolios.slice(0, visibleCount);
  const hasMore = visibleCount < portfolios.length;

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
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={displayedPortfolios.map(p => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-4">
            {displayedPortfolios.map((item) => (
              <SortablePortfolioItem key={item.id} item={item} onDelete={handleDelete} />
            ))}
            {portfolios.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-400 font-medium tracking-wide">
                등록된 포트폴리오가 없습니다.
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

      {hasMore && (
        <div className="w-full py-8 mb-10 flex justify-center items-center">
          <button 
            onClick={() => setVisibleCount(prev => prev + 6)}
            className="w-12 h-12 flex items-center justify-center bg-white border border-gray-300 hover:border-black hover:bg-gray-50 text-black rounded-full transition-all shadow-sm"
            title="더보기"
          >
            <span className="text-2xl font-light mb-1">+</span>
          </button>
        </div>
      )}

      <PortfolioUploadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(newPortfolios) => {
          // 새로 추가된 사진들을 배열의 맨 앞에 추가 (최신순)
          setPortfolios(prev => [...newPortfolios, ...prev]);
          alert('포트폴리오 업로드가 완료되었습니다.');
        }}
      />
    </div>
  );
}
