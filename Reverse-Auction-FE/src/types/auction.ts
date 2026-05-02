export type AuctionStatus = "OPEN" | "CLOSED" | "COMPLETED";

export interface Auction {
  id: number;
  title?: string;
  buyerId?: number;
  buyerName?: string;
  categoryId?: number;
  categoryName?: string;
  budgetMax?: number;
  endDate: string;
  description?: string;
  status?: AuctionStatus;
  createdAt: string;
  lowestPrice?: number;
  totalBids?: number;
  quantity?: number;
  location?: string;
  paymentMethod?: string;
  images?: string[];
}

export interface Bid {
  id: string;
  auctionId: string;
  sellerId: string;
  sellerName: string;
  bidPrice: number;
  isWinner?: boolean;
  note?: string;
  isTopBid?: boolean;
  createdAt: string;
  updatedAt: string;
}
