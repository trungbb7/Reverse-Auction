export type AuctionStatus = "OPEN" | "CLOSED" | "COMPLETED";

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
  images: [],
};
