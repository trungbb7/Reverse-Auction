export type AuctionStatus = "OPEN" | "CLOSED" | "COMPLETED" | "CANCELLED";

export const auctionStatusMap = {
  OPEN: "Đang diễn ra",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn thành",
};

export interface Auction {
  id: number;
  title?: string;
  buyerId?: number;
  buyerName?: string;
  buyerRating?: number;
  buyerTotalReviews?: number;
  buyerKycStatus?: "UNVERIFIED" | "PENDING" | "APPROVED" | "REJECTED";
  buyerTotalOrders?: number;
  buyerCompletionRate?: number;
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
  imageUrls?: string[];
  orderId?: number;
}

export interface Bid {
  id: number;
  auctionId: number;
  sellerId: number;
  sellerName: string;
  bidPrice: number;
  isWinner?: boolean;
  note?: string;
  isTopBid?: boolean;
  createdAt: string;
  updatedAt: string;
  auctionTitle?: string;
  auctionStatus?: string;
  auctionBudget?: number;
  categoryName?: string;
  sellerRating?: number;
  sellerTotalReviews?: number;
  sellerTotalOrders?: number;
  sellerCompletionRate?: number;
  sellerKycStatus?: "UNVERIFIED" | "PENDING" | "APPROVED" | "REJECTED";
}

export const auctionEmpty: Auction = {
  id: 0,
  title: "",
  buyerId: 0,
  buyerName: "",
  categoryId: 0,
  categoryName: "",
  budgetMax: 0,
  endDate: "",
  description: "",
  status: "OPEN",
  createdAt: "",
  lowestPrice: 0,
  totalBids: 0,
  quantity: 0,
  location: "",
  paymentMethod: "",
  imageUrls: [],
};
