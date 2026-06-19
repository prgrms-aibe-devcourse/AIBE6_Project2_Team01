import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Image from 'next/image';
import { Portfolio } from '@/types/model';

interface Props {
  item: Portfolio;
  onDelete: (id: number) => void;
}

export function SortablePortfolioItem({ item, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative aspect-[3/4] rounded-lg overflow-hidden group bg-gray-50 border border-gray-200 cursor-grab active:cursor-grabbing"
      {...attributes} 
      {...listeners}
    >
      <Image
        src={item.imgUrl}
        alt={`포트폴리오 ${item.id}`}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
      {/* 오버레이 및 삭제 버튼 */}
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
        <button 
          onPointerDown={(e) => {
            e.stopPropagation(); // 드래그 이벤트와 충돌 방지
            onDelete(item.id);
          }}
          className="w-10 h-10 bg-red-500/80 hover:bg-red-600 rounded-full flex items-center justify-center text-white pointer-events-auto transition-colors" 
          title="삭제하기"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}
