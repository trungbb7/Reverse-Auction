export type AuctionStatus = "DRAFT" | "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Auction {
  id: string;
  title: string;
  category: string;
  maxBudget: number;
  endDate: string;
  description: string;
  status: AuctionStatus;
  createdAt: string;
  lowestBid?: number;
  totalBids?: number;
  specifications?: Record<string, string>;
}

export interface Bid {
  id: string;
  auctionId: string;
  sellerId: string;
  sellerName: string;
  amount: number;
  createdAt: string;
  isWinner?: boolean;
}
