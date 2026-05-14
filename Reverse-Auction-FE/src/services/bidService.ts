import api from "@/utils/axios";
import type { Bid } from "@/types/auction";
import { AxiosError } from "axios";
import type { Client } from "@stomp/stompjs";

interface BidRequest {
  auctionId: string | undefined;
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

  placeSocketBid: (data: BidRequest, client: Client | null) => {
    if (client)
      client.publish({
        destination: `/app/place-bid/${data.auctionId}`,
        body: JSON.stringify(data),
      });
  },

  updateSocketBid: (
    bidId: string | number,
    data: BidRequest,
    client: Client | null,
  ) => {
    if (client)
      client.publish({
        destination: `/app/update-bid/${data.auctionId}`,
        body: JSON.stringify({
          ...data,
          bidId,
        }),
      });
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
