import api from "@/utils/axios";

export interface AuctionMessage {
  msgId: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  auctionId: number;
  content: string;
  type: string;
  url?: string;
  time: string;
}

export const auctionMessageService = {
  getConversation: async (auctionId: number | string, sellerId?: number | string): Promise<AuctionMessage[]> => {
    const params = new URLSearchParams({ auctionId: String(auctionId) });
    if (sellerId) params.append("sellerId", String(sellerId));
    
    const { data } = await api.get(`/messages/conversation?${params.toString()}`);
    return data;
  },
};
