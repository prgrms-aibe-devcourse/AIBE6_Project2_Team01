'use client';

import { uploadImage } from '@/lib/api/image';
import { updateMyModel } from '@/lib/api/model';
import { Model } from '@/types/model';
import { REGION_OPTIONS } from '@/lib/constants/region';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  initialData: Model;
}

export function ModelEditForm({ initialData }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Model>>({
    name: initialData.name,
    age: initialData.age,
    height: initialData.height,
    weight: initialData.weight,
    sex: initialData.sex,
    region: initialData.region || '',
    field: initialData.field || '',
    tags: initialData.tags || [],
    introduction: initialData.introduction || '',
    profileImageUrl: initialData.profileImageUrl || ''
  });

  const [tagInput, setTagInput] = useState('');


  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>(initialData.profileImageUrl || '');


  const [selectedFile, setSelectedFile] = useState<File | null>(null);


  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl); // 기존 코드 (화면 미리보기용)
      setSelectedFile(file);    // 나중에 백엔드로 보내기 위해 File 객체를 쥐고 있음
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let parsedValue: string | number | boolean | undefined = value;
    if (type === 'number') {
      parsedValue = value ? Number(value) : undefined;
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleFieldToggle = (category: string) => {
    const currentFields = formData.field ? formData.field.split(',').filter(Boolean) : [];
    if (currentFields.includes(category)) {
      setFormData(prev => ({ ...prev, field: currentFields.filter(f => f !== category).join(',') }));
    } else {
      setFormData(prev => ({ ...prev, field: [...currentFields, category].join(',') }));
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !(formData.tags || []).includes(newTag)) {
        setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), newTag] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: (prev.tags || []).filter(t => t !== tagToRemove) }));
  };

  const CATEGORY_OPTIONS = [
    { label: '헤어', value: 'HAIR' },
    { label: '메이크업', value: 'MAKEUP' },
    { label: '손/부분', value: 'HAND' },
    { label: '피팅', value: 'FITTING' },
    { label: '의류', value: 'CLOTHING' },
    { label: '기타', value: 'ETC' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      let finalImageUrl = formData.profileImageUrl; // 기존 이미지 유지
     
      if (selectedFile) {
        // 1. 이미지를 먼저 GCS로 보내기
        const uploadedUrl = await uploadImage(selectedFile);
        // 2. 성공하면 백엔드에서 받아온 구글 스토리지 URL로 교체
        finalImageUrl = uploadedUrl; 
      }
      const finalFormData = { // gcs img url을 포함한 데이터 완성
        ...formData,
        profileImageUrl: finalImageUrl,
        categories: formData.field ? formData.field.split(',').filter(Boolean) : [], // 콤마 문자열을 배열로 변환하여 전송
      };
      await updateMyModel(finalFormData);
      alert('프로필이 성공적으로 수정되었습니다.');
      
      router.push('/my/profile'); // TODO: Create /my/profile page if it doesn't exist
      router.refresh();
    } catch (err: unknown) {
      setError((err as Error).message || '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8 bg-white p-8 md:p-12 text-black">
      <div className="mb-10 text-center border-b-2 border-black pb-6">
        <h1 className="text-3xl font-black text-black tracking-tighter uppercase">Edit Profile</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">프로필 정보를 최신 상태로 유지하세요</p>
      </div>

      {error && (
        <div className="p-4 bg-error-soft border border-error-soft text-error rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 프로필 이미지 업로드 영역 */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="relative group cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="w-36 h-36 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center relative">
            {previewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
          <img 
                src={previewUrl} 
                alt="프로필 미리보기" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.png';
                }}
              />
            ) : (
              <span className="text-gray-400 text-sm">이미지 없음</span>
            )}
            
            {/* 호버 시 나타나는 오버레이 */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-sm font-bold tracking-widest uppercase">변경</span>
            </div>
          </div>
        </div>
        <p className="text-black text-xs mt-4 tracking-widest uppercase font-bold">Profile Image</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">이름 (Name)</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name || ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors"
          placeholder="이름을 입력하세요"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">나이 (Age)</label>
          <input
            type="number"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors"
            placeholder="예: 25"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">성별 (Gender)</label>
          <select
            name="sex"
            value={formData.sex || 'M'}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors appearance-none"
          >
            <option value="M">남성</option>
            <option value="F">여성</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">키 (Height, cm)</label>
          <input
            type="number"
            name="height"
            value={formData.height || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors"
            placeholder="예: 178"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">몸무게 (Weight, kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors"
            placeholder="예: 65"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">지역 (Region)</label>
          <select
            name="region"
            value={formData.region || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors appearance-none"
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

      <div>
        <label className="block text-xs font-bold text-black mb-3 uppercase tracking-wider">카테고리 (Category)</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map(cat => {
            const isSelected = (formData.field || '').split(',').includes(cat.value);
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleFieldToggle(cat.value)}
                className={`px-6 py-2 text-xs font-bold tracking-wider uppercase transition-colors border ${
                  isSelected 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">태그 (Tags)</label>
        <div className="w-full p-2 bg-white border border-gray-300 focus-within:border-black transition-colors flex flex-wrap gap-2 items-center">
          {(formData.tags || []).map((tag, idx) => (
            <span key={idx} className="flex items-center px-3 py-1 bg-black text-white font-bold text-xs tracking-wider uppercase">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="ml-2 text-gray-400 hover:text-white focus:outline-none">
                &times;
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={(!formData.tags || formData.tags.length === 0) ? "태그 입력 후 엔터..." : ""}
            className="flex-1 min-w-[120px] bg-transparent text-black placeholder-gray-400 focus:outline-none px-2 py-1 text-sm font-medium"
          />
        </div>
        <p className="text-gray-400 text-xs mt-2 font-medium tracking-wide">엔터(Enter)나 쉼표(,)를 눌러 태그를 추가하세요</p>
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">소개글 (About)</label>
        <textarea
          name="introduction"
          value={formData.introduction || ''}
          onChange={handleChange}
          rows={5}
          className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors resize-none"
          placeholder="자신을 소개하는 글을 작성해보세요."
        />
      </div>

      <div className="pt-8 flex justify-end gap-3 border-t border-black">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 bg-white border border-black text-black hover:bg-gray-50 transition-colors text-xs font-bold tracking-widest uppercase"
        >
          취소 (Cancel)
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-black text-white hover:bg-gray-900 transition-colors text-xs font-bold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed border border-black"
        >
          {isLoading ? '저장 중...' : '저장하기 (Save)'}
        </button>
      </div>
    </form>
  );
}
