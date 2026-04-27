export type AuctionStatus = "OPEN" | "CLOSED" | "COMPLETED";

export interface Auction {
  id: number;
  title?: string;
  categoryId?: number;
  categoryName?: string;
  budgetMax?: number;
  endDate: string;
  description?: string;
  status?: AuctionStatus;
  createdAt: string;
  lowestBid?: number;
  totalBids?: number;
  quantity?: number;
}

export interface Bid {
  id: string;
  auctionId: string;
  sellerId: string;
  sellerName: string;
  bidPrice: number;
  createdAt: string;
  isWinner?: boolean;
}
