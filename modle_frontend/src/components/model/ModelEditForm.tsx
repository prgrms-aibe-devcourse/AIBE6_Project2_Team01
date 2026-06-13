'use client';

import { updateMyModel } from '@/lib/api/model';
import { Model } from '@/types/model';
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
    gender: initialData.gender,
    field: initialData.field || '',
    introduction: initialData.introduction || '',
    profileImageUrl: initialData.profileImageUrl || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string>(initialData.profileImageUrl || '');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 미리보기 생성
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // TODO: 실제 백엔드 연동 시, 여기서 폼 데이터에 File 객체를 저장하거나
      // S3/서버에 업로드 후 반환받은 URL을 formData.profileImageUrl에 저장해야 합니다.
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    
    let parsedValue: any = value;
    if (type === 'number') {
      parsedValue = value ? Number(value) : undefined;
    } else if (name === 'gender') {
      parsedValue = value === 'true';
    }

    setFormData(prev => ({ ...prev, [name]: parsedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await updateMyModel(formData);
      alert('프로필이 성공적으로 수정되었습니다.\n(참고: 이미지 업로드는 프론트엔드 UI만 적용된 상태입니다)');
      
      router.push('/my/profile'); // TODO: Create /my/profile page if it doesn't exist
      router.refresh();
    } catch (err: any) {
      setError(err.message || '프로필 수정에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6 bg-surface p-8 rounded-xl shadow-sm border border-hairline">
      {error && (
        <div className="p-4 bg-error-soft text-error rounded-lg text-sm">
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
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-hairline-strong bg-canvas-soft flex items-center justify-center relative">
            {previewUrl ? (
              <img src={previewUrl} alt="프로필 미리보기" className="w-full h-full object-cover" />
            ) : (
              <span className="text-mute text-sm">이미지 없음</span>
            )}
            
            {/* 호버 시 나타나는 오버레이 */}
            <div className="absolute inset-0 bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-on-primary text-sm font-medium">변경하기</span>
            </div>
          </div>
        </div>
        <p className="text-mute text-xs mt-2">프로필 이미지를 클릭하여 변경하세요</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">이름</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-hairline-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">나이</label>
          <input
            type="number"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-hairline-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">성별</label>
          <select
            name="gender"
            value={formData.gender !== undefined ? String(formData.gender) : 'true'}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-hairline-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="true">남성</option>
            <option value="false">여성</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">키 (cm)</label>
          <input
            type="number"
            name="height"
            value={formData.height || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-hairline-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1">몸무게 (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-hairline-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">분야</label>
        <select
          name="field"
          value={formData.field || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-hairline-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">선택 안함</option>
          <option value="패션">패션</option>
          <option value="뷰티">뷰티</option>
          <option value="피트니스">피트니스</option>
          <option value="라이프스타일">라이프스타일</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1">소개글</label>
        <textarea
          name="introduction"
          value={formData.introduction || ''}
          onChange={handleChange}
          rows={5}
          className="w-full px-4 py-2 border border-hairline-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 text-body bg-canvas-soft border border-hairline hover:bg-hairline rounded-lg transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 text-on-primary bg-primary hover:bg-primary-hover rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? '저장 중...' : '저장하기'}
        </button>
      </div>
    </form>
  );
}
