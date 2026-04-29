import api from "@/utils/axios";
import type { Auction } from "@/types/auction";

export interface AuctionSearchParams {
  keyword?: string;
  categoryId?: number;
  status?: string;
  minBudget?: number;
  maxBudget?: number;
  page?: number;
  size?: number;
}

export interface PagedResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const auctionService = {
  searchAuctions: async (
    params: AuctionSearchParams
  ): Promise<PagedResult<Auction>> => {
    const response = await api.get("/auctions", { params });
    return response.data;
  },

  getAuctionById: async (id: string | number): Promise<Auction> => {
    const response = await api.get(`/auctions/${id}`);
    return response.data;
  },
};
