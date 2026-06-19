// src/types/model.ts
export interface Portfolio {
  id: number;
  imgUrl: string;
}
export interface Model {
  id: number;
  userId: number;
  name: string;
  region?: string;
  rating: number;
  reviewCount: number;
  profileImageUrl: string;
  categories?: string[];
  age?: number;
  height?: number;
  weight?: number;
  sex?: "M" | "F";
  careerStartDate?: string;
  activeRegions?: string[];
  field?: string;
  tags?: string[];
  introduction?: string;
  portfolios?: Portfolio[];
}

export interface ModelListResponse {
  models: Model[];
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
