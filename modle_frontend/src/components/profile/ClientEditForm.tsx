'use client';

import { uploadImage } from '@/lib/api/image';
import { updateMyClient } from '@/lib/api/clientProfile';
import { Client } from '@/types/client';
import { REGION_OPTIONS } from '@/lib/constants/region';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  initialData: Client;
}

export function ClientEditForm({ initialData }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Client>>({
    companyName: initialData.companyName,
    companyNumber: initialData.companyNumber,
    clientType: initialData.clientType,
    region: initialData.region,
    introduction: initialData.introduction || '',
    profileImageUrl: initialData.profileImageUrl || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>(initialData.profileImageUrl || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setSelectedFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      let imageUrlToSubmit = formData.profileImageUrl;

      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          imageUrlToSubmit = uploadedUrl;
        } else {
          throw new Error('이미지 업로드에 실패했습니다.');
        }
      }

      await updateMyClient({
        ...formData,
        profileImageUrl: imageUrlToSubmit
      });
      
      router.push('/my/profile');
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('프로필 수정 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border-2 border-black p-8 text-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter border-b-2 border-black pb-4">
        의뢰인 프로필 수정
      </h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-bold text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Image Section */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0 cursor-pointer overflow-hidden group border-2 border-black bg-gray-50">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <span className="text-white text-sm font-bold uppercase tracking-widest">변경</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <p className="text-xs text-gray-500 font-bold">프로필 이미지를 클릭하여 변경하세요.</p>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-black">회사명 (이름)</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-black font-medium"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-black">사업자 번호</label>
            <input
              type="text"
              name="companyNumber"
              value={formData.companyNumber || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-black font-medium"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-black">의뢰인 유형</label>
            <select
              name="clientType"
              value={formData.clientType || 'INDIVIDUAL'}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-black font-medium"
            >
              <option value="INDIVIDUAL">개인</option>
              <option value="ORGANIZATION">기업</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-black">지역</label>
            <select
              name="region"
              value={formData.region || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-black font-medium"
            >
              <option value="" disabled>지역을 선택하세요</option>
              {REGION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-widest text-black">소개글</label>
          <textarea
            name="introduction"
            value={formData.introduction || ''}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-3 border border-black bg-white focus:outline-none focus:ring-2 focus:ring-black text-black font-medium resize-none"
            placeholder="자신이나 회사를 소개해주세요."
          />
        </div>

        <div className="flex gap-4 pt-6 border-t-2 border-black">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 border-2 border-black bg-white text-black font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-8 py-4 bg-black text-white font-black text-sm uppercase tracking-widest hover:bg-gray-900 transition-colors shadow-[4px_4px_0_0_rgba(156,163,175,1)] hover:shadow-[2px_2px_0_0_rgba(156,163,175,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
            disabled={isLoading}
          >
            {isLoading ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
