import api from "@/utils/axios";
import type { Bid } from "@/types/auction";
import { AxiosError } from "axios";

interface BidRequest {
  auctionId: string | number;
  bidPrice: number;
  note?: string;
}

export const bidService = {
  submitBid: async (data: BidRequest): Promise<Bid> => {
    const response = await api.post("/bids", data);
    return response.data;
  },

  updateBid: async (
    bidId: string | number,
    data: Omit<BidRequest, "auctionId">,
  ): Promise<Bid> => {
    const response = await api.put(`/bids/${bidId}`, data);
    return response.data;
  },

  getMyBidForAuction: async (
    auctionId: string | number,
  ): Promise<Bid | null> => {
    try {
      const response = await api.get(`/bids/my`, { params: { auctionId } });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  getBidsForAuction: async (auctionId: string | number): Promise<Bid[]> => {
    const response = await api.get(`/bids`, { params: { auctionId } });
    return response.data.bids;
  },
};
