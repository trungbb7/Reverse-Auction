export interface Product {
  id: number;
  name: string;
  imageUrl: string | null;
  brand: string | null;
  description: string | null;
  stock: number | null;
  rating: number | null;
  price: number | null;
  listedForSale: boolean;
  sellerId: number | null;
  sellerName: string | null;
}

export interface ProductRequest {
  name: string;
  imageUrl?: string | null;
  brand?: string | null;
  description?: string | null;
  stock: number;
  price: number;
}

export interface PageResponse<T> {
  content: T[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
