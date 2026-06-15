export interface Client {
  id: number;
  createdDate?: string;
  modifiedDate?: string;
  clientType: string;
  companyName: string;
  companyNumber: string;
  introduction: string;
  profileImageUrl: string;
  avgRating: number;
  reviewCount: number;
}

export interface ClientListResponse {
  clients: Client[];
  totalElements: number;
  hasNext: boolean;
}
