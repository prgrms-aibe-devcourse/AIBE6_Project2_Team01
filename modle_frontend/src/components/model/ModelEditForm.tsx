'use client';

import { Toast, type ToastState } from '@/components/ui/Toast';
import { uploadImage } from '@/lib/api/image';
import { updateMyModel } from '@/lib/api/model';
import { REGION_OPTIONS } from '@/lib/constants/region';
import { Model } from '@/types/model';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

interface Props {
  initialData: Model;
}

const normalizeRegion = (region?: string) => {
  if (!region) {
    return '';
  }
  return REGION_OPTIONS.find((option) => option.value === region || option.label === region)?.value || region;
};

export function ModelEditForm({ initialData }: Props) {
  const router = useRouter();
  const initialRegion = normalizeRegion(initialData.activeRegions?.[0] || initialData.region);
  const [formData, setFormData] = useState<Partial<Model>>({
    name: initialData.name,
    age: initialData.age,
    height: initialData.height,
    weight: initialData.weight,
    sex: initialData.sex,
    region: initialRegion,
    activeRegions: initialRegion ? [initialRegion] : [],
    field: initialData.categories?.join(',') || initialData.field || '',
    tags: initialData.tags || [],
    introduction: initialData.introduction || '',
    profileImageUrl: initialData.profileImageUrl || '',
    experience: initialData.experience,
    topSize: initialData.topSize,
    bottomSize: initialData.bottomSize,
    shoeSize: initialData.shoeSize,
    availableDays: initialData.availableDays
  });

  const [tagInput, setTagInput] = useState('');


  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setIsRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

    if (name === 'region') {
      setFormData(prev => ({ ...prev, region: value, activeRegions: value ? [value] : [] }));
      return;
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
      
      if (newTag) {
        const currentTags = formData.tags || [];
        if (currentTags.length >= 20) {
          setError('태그는 최대 20개까지만 등록할 수 있습니다.');
          return;
        }
        if (!currentTags.includes(newTag)) {
          setFormData(prev => ({ ...prev, tags: [...currentTags, newTag] }));
          setError(null); // Clear error on successful tag add
        }
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
    { label: '푸드', value: 'FOOD' },
    { label: '제품', value: 'PRODUCT' },
    { label: '기타', value: 'ETC' },
  ];

  const DAY_OPTIONS = ['월', '화', '수', '목', '금', '토', '일'];

  const handleDaysToggle = (day: string) => {
    const currentDays = formData.availableDays ? formData.availableDays.split(',').filter(Boolean) : [];
    if (currentDays.includes(day)) {
      setFormData(prev => ({ ...prev, availableDays: currentDays.filter(d => d !== day).join(',') }));
    } else {
      setFormData(prev => ({ ...prev, availableDays: [...currentDays, day].join(',') }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.name?.trim()) {
      setError('이름(Name)을 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (formData.age === undefined || formData.age < 1 || formData.age > 120) {
      setError('나이는 1~120 사이로 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (formData.height === undefined || formData.height < 30 || formData.height > 250) {
      setError('키는 30~250cm 사이로 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (formData.weight === undefined || formData.weight < 2 || formData.weight > 200) {
      setError('몸무게는 2~200kg 사이로 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (formData.experience !== undefined && (formData.experience < 0 || formData.experience > 60)) {
      setError('경력은 0~60 사이로 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (formData.shoeSize !== undefined && (formData.shoeSize < 200 || formData.shoeSize > 350)) {
      setError('발사이즈는 200~350 사이로 입력해주세요.');
      setIsLoading(false);
      return;
    }

    if (!formData.field) {
      setError('희망 활동분야(Category)를 하나 이상 선택해주세요.');
      setIsLoading(false);
      return;
    }

    try {
      let finalImageUrl = formData.profileImageUrl; // 기존 이미지 유지
     
      if (selectedFile) {
        // 1. 이미지를 먼저 GCS로 보내기
        const uploadedUrl = await uploadImage(selectedFile);
        // 2. 성공하면 백엔드에서 받아온 구글 스토리지 URL로 교체
        finalImageUrl = uploadedUrl; 
      }
      const selectedRegions = formData.activeRegions?.length
        ? formData.activeRegions
        : formData.region
          ? [formData.region]
          : [];
      const finalFormData = { // gcs img url을 포함한 데이터 완성
        ...formData,
        profileImageUrl: finalImageUrl,
        activeRegions: selectedRegions,
        categories: formData.field ? formData.field.split(',').filter(Boolean) : [], // 콤마 문자열을 배열로 변환하여 전송
      };
      await updateMyModel(finalFormData);
      setToast({ type: 'success', message: '프로필이 성공적으로 수정되었습니다.' });
      
      setTimeout(() => {
        router.push('/my/profile'); // TODO: Create /my/profile page if it doesn't exist
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      setError((err as Error).message || '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl mx-auto space-y-8 bg-white border border-hairline p-8 md:p-12 text-black shadow-xl rounded-[2.5rem]">
      <div className="mb-10 text-center border-b-2 border-black pb-6">
        <h1 className="text-3xl font-black text-black tracking-tighter uppercase">Edit Profile</h1>
        <p className="text-sm text-gray-500 mt-2 font-medium tracking-wide">프로필 정보를 최신 상태로 유지하세요</p>
      </div>

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
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src="/placeholder.png" alt="기본 프로필" className="w-full h-full object-cover opacity-50" />
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
          value={formData.name || ''}
          onChange={handleChange}
          className="w-full px-5 py-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black font-medium transition-all shadow-sm"
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
          <div className="relative">
            <select
              name="sex"
              value={formData.sex || 'M'}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors appearance-none"
            >
              <option value="M">남성</option>
              <option value="F">여성</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        <div>
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">발사이즈 (Shoe, mm)</label>
          <input
            type="number"
            name="shoeSize"
            value={formData.shoeSize || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors"
            placeholder="예: 260"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">상의 사이즈 (Top Size)</label>
          <div className="relative">
            <select
              name="topSize"
              value={formData.topSize || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors appearance-none cursor-pointer"
            >
              <option value="">상의 사이즈 선택</option>
              <option value="SS">SS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">하의 사이즈 (Bottom Size)</label>
          <div className="relative">
            <select
              name="bottomSize"
              value={formData.bottomSize || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors appearance-none cursor-pointer"
            >
              <option value="">하의 사이즈 선택</option>
              <option value="SS">SS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">경력 (Experience) - 년 단위</label>
        <input
          type="number"
          name="experience"
          min="0"
          max="60"
          value={formData.experience ?? ''}
          onChange={handleChange}
          className="w-full px-4 py-3 bg-white border border-gray-300 text-black focus:outline-none focus:border-black focus:ring-0 transition-colors"
          placeholder="숫자로 입력 (0 입력 시 '신입'으로 표시됩니다)"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wider">지역 (Region)</label>
          <div className="relative" ref={regionRef}>
            <div
              onClick={() => setIsRegionOpen(!isRegionOpen)}
              className="w-full px-4 py-3 bg-white border border-gray-300 text-black cursor-pointer flex justify-between items-center transition-colors hover:border-black rounded-lg"
            >
              <span className={formData.region ? "text-black" : "text-gray-500"}>
                {formData.region ? REGION_OPTIONS.find(o => o.value === formData.region)?.label : "지역을 선택하세요"}
              </span>
              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isRegionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </div>
            {isRegionOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                <div
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-gray-500"
                  onClick={() => { handleChange({ target: { name: 'region', value: '' } } as any); setIsRegionOpen(false); }}
                >
                  지역을 선택하세요
                </div>
                {REGION_OPTIONS.map(option => (
                  <div
                    key={option.value}
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-black"
                    onClick={() => { handleChange({ target: { name: 'region', value: option.value } } as any); setIsRegionOpen(false); }}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-3 uppercase tracking-wider">촬영 가능 요일 (Available Days)</label>
        <div className="flex flex-wrap gap-2">
          {DAY_OPTIONS.map(day => {
            const isSelected = (formData.availableDays || '').split(',').includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => handleDaysToggle(day)}
                className={`px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors border rounded-full ${
                  isSelected 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-gray-500 border-gray-300 hover:border-black hover:text-black'
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-black mb-3 uppercase tracking-wider">희망 활동분야 (Category)</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map(cat => {
            const isSelected = (formData.field || '').split(',').includes(cat.value);
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => handleFieldToggle(cat.value)}
                className={`px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition-colors border rounded-full ${
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
        <div className="w-full p-2 bg-white border border-gray-300 focus-within:border-black focus-within:ring-2 focus-within:ring-black transition-all rounded-2xl flex flex-wrap gap-2 items-center shadow-sm">
          {(formData.tags || []).map((tag, idx) => (
            <span key={idx} className="flex items-center px-4 py-1.5 bg-black text-white font-bold text-xs tracking-wider uppercase rounded-full">
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
            className="flex-1 min-w-[120px] bg-transparent text-black placeholder-gray-400 focus:outline-none px-3 py-2 text-sm font-medium"
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
          className="w-full px-5 py-4 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black font-medium transition-all shadow-sm resize-none"
          placeholder="자신을 소개하는 글을 작성해보세요."
        />
      </div>

      <div>
        {error && (
          <div className="mb-4 p-4 bg-error-soft border border-error-soft text-error rounded-xl text-sm font-bold text-center shadow-sm">
            {error}
          </div>
        )}
        <div className="pt-6 flex justify-end gap-4 border-t border-hairline mt-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-4 border border-gray-300 rounded-full bg-white text-black hover:bg-gray-50 transition-colors text-xs font-bold tracking-widest uppercase shadow-sm"
          >
            취소 (Cancel)
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-black text-white hover:bg-gray-900 transition-all rounded-full text-xs font-bold tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:-translate-y-0.5"
          >
            {isLoading ? '저장 중...' : '저장하기 (Save)'}
          </button>
        </div>
      </div>
      {toast && <Toast toast={toast} />}
    </form>
  );
}
