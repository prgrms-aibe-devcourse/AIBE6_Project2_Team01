'use client';

import Image from 'next/image';
import { deletePortfolioImage, reorderPortfolioImages, updatePortfolioCategory } from '@/lib/api/portfolio';
import { Portfolio } from '@/types/model';
import { closestCenter, DndContext, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, rectSortingStrategy, SortableContext } from '@dnd-kit/sortable';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Toast, type ToastState } from '@/components/ui/Toast';
import { PortfolioUploadModal } from './PortfolioUploadModal';
import { SortablePortfolioItem } from './SortablePortfolioItem';
import { CATEGORY_OPTIONS, getCategoryLabel } from '@/lib/constants/category';
import { ScrollToTopButton } from '@/components/ui/ScrollToTopButton';

interface Props {
  modelId: number;
  initialPortfolios?: Portfolio[]; // 백엔드에서 받아온 초기 사진들
}

export function PortfolioGallery({ initialPortfolios = [] }: Props) {
  // 화면에 보여줄 사진 목록 상태
  const [portfolios, setPortfolios] = useState<Portfolio[]>(initialPortfolios);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editingPortfolioId, setEditingPortfolioId] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<string>('');
  const [toast, setToast] = useState<ToastState | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);
  
  const categories = CATEGORY_OPTIONS.map(opt => opt.value);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const filteredPortfolios = portfolios.filter(p => 
    selectedCategories.length === 0 || (p.category && selectedCategories.includes(p.category))
  );

  const getCategoryCount = (category: string) => {
    return portfolios.filter(p => p.category === category).length;
  };
  
  const INITIAL_COUNT = 6;
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  // [삭제 로직]
  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 사진을 삭제하시겠습니까?')) return;

    try {
      await deletePortfolioImage(id);
      setPortfolios(prev => prev.filter(p => p.id !== id));
      setToast({ type: 'success', message: '삭제되었습니다.' });
    } catch {
      setToast({ type: 'error', message: '삭제 중 오류가 발생했습니다.' });
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
        setToast({ type: 'error', message: '순서 저장에 실패했습니다.' });
        setPortfolios(portfolios); // 실패 시 롤백
      }
    }
  };

  // 최신순 정렬 (id 기준 역순) -> 백엔드에서 순서 적용이 되면 DB 정렬에 따르는게 맞지만 
  // 현재는 초기 불러올때 id역순(또는 displayOrder)으로 받았다고 가정하고 프론트엔드에서는 배열 순서 그대로 렌더링
  const displayedPortfolios = filteredPortfolios.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPortfolios.length;

  return (
    <div className="animate-in fade-in duration-300">
      <ScrollToTopButton />
      <div className="flex justify-between items-end mb-6 border-b border-black pb-4 text-black">
        <div>
          <h2 className="text-xl font-black text-black mb-1 uppercase tracking-widest">나의 포트폴리오</h2>
          <p className="text-xs text-gray-500 tracking-wide">업로드된 {portfolios.length}개의 작품</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <div className="text-sm font-bold text-gray-700 mr-1">총 {filteredPortfolios.length}개</div>
          {/* 필터 영역 */}
          <div className="relative" ref={filterRef}>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              필터 {selectedCategories.length > 0 && `(${selectedCategories.length})`}
            </button>

            {isFilterOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 p-2">
                {categories.map(cat => (
                  <label key={cat} className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(cat)} 
                      onChange={() => handleCategoryChange(cat)}
                      className="rounded border-gray-300 accent-black w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">{getCategoryLabel(cat)} ({getCategoryCount(cat)})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-2 bg-black border border-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-widest transition-colors rounded-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            업로드
          </button>
        </div>
      </div>

      {/* Grid: 진짜 데이터 렌더링 */}
      <DndContext id="portfolio-dnd-context" collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={displayedPortfolios.map(p => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 mb-4">
            {displayedPortfolios.map((item, index) => (
              <SortablePortfolioItem 
                key={item.id} 
                item={item} 
                onDelete={handleDelete} 
                onZoom={() => setSelectedIndex(index)} 
                onEdit={(id, currentCategory) => {
                  setEditingPortfolioId(id);
                  setEditingCategory(currentCategory || '');
                }}
              />
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
          setToast({ type: 'success', message: '포트폴리오 업로드가 완료되었습니다.' });
        }}
      />

      {/* ================= 카테고리 수정 모달 ================= */}
      {mounted && editingPortfolioId && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/10 backdrop-blur-[2px] p-4" onClick={() => setEditingPortfolioId(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 text-black">카테고리 수정</h3>
            <select 
              value={editingCategory}
              onChange={(e) => setEditingCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 mb-6 text-black focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
            >
              <option value="" disabled>카테고리를 선택하세요</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => setEditingPortfolioId(null)}
                className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                취소
              </button>
              <button 
                onClick={async () => {
                  if (!editingCategory) {
                    setToast({ type: 'error', message: '카테고리를 선택해주세요.' });
                    return;
                  }
                  try {
                    await updatePortfolioCategory(editingPortfolioId, editingCategory);
                    setPortfolios(prev => prev.map(p => p.id === editingPortfolioId ? { ...p, category: editingCategory } : p));
                    setToast({ type: 'success', message: '카테고리가 성공적으로 수정되었습니다.' });
                    setEditingPortfolioId(null);
                  } catch (e: unknown) {
                    setToast({ type: 'error', message: (e as Error).message || '수정 중 오류가 발생했습니다.' });
                  }
                }}
                className="px-4 py-2 text-sm text-white bg-black hover:bg-gray-900 rounded-md transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ================= 크게 보기 모달 ================= */}
      {mounted && selectedIndex !== null && filteredPortfolios[selectedIndex] && createPortal(
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-95 p-4 md:p-8"
          onClick={() => setSelectedIndex(null)}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white text-4xl hover:text-gray-300 transition-colors z-[101]"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(null);
            }}
          >
            &times;
          </button>
          
          {selectedIndex > 0 && (
            <button 
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-300 transition-colors z-[101] px-4 py-8"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex - 1); }}
            >
              &#10094;
            </button>
          )}

          <div 
            className="relative w-full max-w-5xl h-[80vh] md:h-[95vh] bg-transparent rounded-lg overflow-hidden flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} 
          >
            <Image
              src={filteredPortfolios[selectedIndex].imgUrl}
              alt="포트폴리오 상세 이미지"
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {selectedIndex < filteredPortfolios.length - 1 && (
            <button 
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white text-5xl hover:text-gray-300 transition-colors z-[101] px-4 py-8"
              onClick={(e) => { e.stopPropagation(); setSelectedIndex(selectedIndex + 1); }}
            >
              &#10095;
            </button>
          )}
        </div>,
        document.body
      )}

      {toast && <Toast toast={toast} />}
    </div>
  );
}
