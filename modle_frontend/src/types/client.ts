export interface Client {
  id: number;
  userId?: number;
  createdDate?: string;
  modifiedDate?: string;
  clientType: string;
  companyName: string;
  companyNumber: string;
  introduction: string;
  profileImageUrl: string;
  avgRating: number;
  reviewCount: number;
  region?: string;
}

export interface ClientListResponse {
  clients: Client[];
  totalElements: number;
  hasNext: boolean;
}
