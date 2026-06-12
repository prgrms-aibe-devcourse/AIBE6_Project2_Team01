'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Model } from '@/types/model';
import { updateModel, updateMyModel } from '@/lib/api/model';

interface Props {
  initialData: Model;
  isMyProfile?: boolean;
}

export function ModelEditForm({ initialData, isMyProfile = false }: Props) {
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
      if (isMyProfile) {
        await updateMyModel(formData);
      } else {
        await updateModel(initialData.id, formData);
      }
      alert('프로필이 성공적으로 수정되었습니다.');
      
      if (isMyProfile) {
        router.push('/my/profile'); // TODO: Create /my/profile page if it doesn't exist
      } else {
        router.push(`/models/${initialData.id}`);
      }
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
        <label className="block text-sm font-medium text-ink mb-1">프로필 이미지 URL</label>
        <input
          type="url"
          name="profileImageUrl"
          value={formData.profileImageUrl || ''}
          onChange={handleChange}
          placeholder="https://..."
          className="w-full px-4 py-2 border border-hairline-strong rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
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
