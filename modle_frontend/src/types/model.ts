// src/types/model.ts
export interface Portfolio {
  id: number;
  imgUrl: string;
  category?: string;
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
  activeRegions?: string[];
  field?: string;
  tags?: string[];
  introduction?: string;
  portfolios?: Portfolio[];
  experience?: string;
  topSize?: string;
  bottomSize?: string;
  shoeSize?: number;
  availableDays?: string;
}

export interface ModelListResponse {
  models: Model[];
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}
