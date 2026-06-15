'use client';

import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import Image from 'next/image';
import { uploadPortfolioImages } from '@/lib/api/portfolio';
import { Portfolio } from '@/types/model';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newPortfolios: Portfolio[]) => void;
}

export function PortfolioUploadModal({ isOpen, onClose, onSuccess }: Props) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setSelectedFiles([]);
      setPreviews((prev) => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
      setIsDragging(false);
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const addFiles = (files: File[]) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
    // 같은 파일 다시 선택할 수 있도록 리셋
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setIsUploading(true);

    try {
      const newPortfolios = await uploadPortfolioImages(selectedFiles);
      onSuccess(newPortfolios);
      onClose();
    } catch (error) {
      alert('업로드 중 오류가 발생했습니다.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h3 className="text-xl font-black text-black tracking-widest uppercase">포트폴리오 업로드</h3>
          <button 
            onClick={onClose} 
            disabled={isUploading}
            className="text-gray-400 hover:text-black transition-colors disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-10 flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm font-bold text-black uppercase tracking-wider mb-1">
              이미지를 이곳으로 드래그 앤 드롭 하세요
            </p>
            <p className="text-xs text-gray-500">
              또는 클릭하여 파일 선택
            </p>
          </div>

          {/* Previews */}
          {previews.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs font-bold text-black tracking-wider uppercase mb-3 border-b border-gray-200 pb-2">
                선택된 이미지 ({previews.length})
              </h4>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square bg-gray-100 group border border-gray-200">
                    <Image
                      src={preview}
                      alt={`preview ${index}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                      title="제외하기"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50">
          <button 
            onClick={onClose}
            disabled={isUploading}
            className="px-6 py-2 border border-black text-black bg-white hover:bg-gray-100 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button 
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || isUploading}
            className="px-6 py-2 bg-black border border-black text-white hover:bg-gray-900 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? '업로드 중...' : '완료 및 업로드'}
          </button>
        </div>
      </div>
    </div>
  );
}
