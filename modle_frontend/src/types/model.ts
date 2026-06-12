// src/types/model.ts
export interface Model {
  id: number;
  name: string;
  region: string;
  rating: number;
  reviewCount: number;
  profileImageUrl: string;
  categories: string[];
}

export interface ModelListResponse {
  models: Model[];
  totalElements: number;
  hasNext: boolean;
}
