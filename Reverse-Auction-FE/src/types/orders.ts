import {
  CheckCircle2,
  Clock3,
  Truck,
  PackageCheck,
  XCircle,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import type { Review } from "@/types/review";
export const ORDER_STATUS_LIST = [
  "AWAITING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
  "DISPUTED",
  "CANCELLED",
  "REFUND",
] as const;
export type OrderStatus = (typeof ORDER_STATUS_LIST)[number];

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  brand: string;
  model: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  reviewed: boolean;
  rating?: number;
}

export interface Order {
  id: number;
  code: string;
  type: "NORMAL" | "BID";

  items: OrderItem[];

  productId: number;
  productName: string;
  imageUrl: string;
  brand: string;

  buyerId: number;
  buyerName: string;
  buyerPhone: string;

  sellerId: number;
  sellerName: string;

  subtotal: number;
  shippingFee: number;
  discount: number;
  finalPrice: number;
  totalAmount: number;

  shippingAddress: string;
  shippingPhone: string;
  shippingRecipientName?: string;

  status: OrderStatus;
  alreadyReviewed: boolean;
  review?: Review;

  commissionRate?: number;
  commissionAmount?: number;

  auctionId?: number;
  bidId?: number;
  auctionTitle?: string;

  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export const ORDER_STEPS: OrderStatus[] = [
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
];

export const ORDER_STATUS_INDEX: Record<OrderStatus, number> = {
  AWAITING_PAYMENT: 0,
  PAID: 0,
  PROCESSING: 1,
  SHIPPED: 2,
  DELIVERED: 3,
  COMPLETED: 3,
  DISPUTED: -1,
  CANCELLED: -1,
  REFUND: -1,
};
export const ORDER_TRANSITION_RULE: Record<OrderStatus, OrderStatus[]> = {
  AWAITING_PAYMENT: ["AWAITING_PAYMENT", "PAID", "CANCELLED"],
  PAID: ["PAID", "PROCESSING", "CANCELLED"],
  PROCESSING: ["PROCESSING", "SHIPPED", "CANCELLED"],
  SHIPPED: ["SHIPPED", "DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  DISPUTED: [],
  CANCELLED: [],
  REFUND: [],
};
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  AWAITING_PAYMENT: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  PROCESSING: "Đang xử lý",
  SHIPPED: "Đang giao",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn tất",
  DISPUTED: "Tranh chấp",
  CANCELLED: "Đã huỷ",
  REFUND: "Đã hoàn tiền",
};
export const orderStatusContent: Record<
  OrderStatus,
  {
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
  }
> = {
  AWAITING_PAYMENT: {
    title: "Chờ thanh toán",
    description: "Đơn hàng đang chờ người mua thanh toán",
    icon: Wallet,
    color: "text-yellow-500",
  },

  PAID: {
    title: "Đã thanh toán",
    description: "Người mua đã thanh toán thành công",
    icon: CheckCircle2,
    color: "text-blue-500",
  },

  PROCESSING: {
    title: "Đang xử lý",
    description: "Người bán đang chuẩn bị đơn hàng",
    icon: Clock3,
    color: "text-indigo-500",
  },

  SHIPPED: {
    title: "Đang vận chuyển",
    description: "Đơn hàng đang được giao đến khách hàng",
    icon: Truck,
    color: "text-blue-600",
  },

  DELIVERED: {
    title: "Đã giao hàng",
    description: "Khách hàng đã nhận được đơn hàng",
    icon: PackageCheck,
    color: "text-green-600",
  },

  COMPLETED: {
    title: "Hoàn thành",
    description: "Đơn hàng đã hoàn tất thành công",
    icon: CheckCircle2,
    color: "text-emerald-600",
  },

  DISPUTED: {
    title: "Đang tranh chấp",
    description: "Đơn hàng đang được xử lý tranh chấp",
    icon: ShieldAlert,
    color: "text-red-500",
  },

  CANCELLED: {
    title: "Đã hủy",
    description: "Đơn hàng đã bị hủy",
    icon: XCircle,
    color: "text-gray-500",
  },
  REFUND: {
    title: "Đã hoàn tiền",
    description: "Đơn hàng đã được hoàn tiền",
    icon: Wallet,
    color: "text-green-500",
  },
};
export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface CheckoutRequest {
  recipientName: string;
  phone: string;
  address: string;
  note?: string;

  paymentMethod: "BALANCE" | "VNPAY" | "COD";
  bankCode?: string;
  selectedCartItemIds: number[];
  shops: {
    shopId: number;
    shippingFee: number;
  }[];
}

export interface CheckoutResponse {
  sessionId: number;
  sessionCode: string;
  totalAmount: number;
  paymentUrl?: string;
}
