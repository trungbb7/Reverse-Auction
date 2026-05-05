export const ORDER_STATUS_LIST = [
    "AWAITING_PAYMENT",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "COMPLETED",
    "DISPUTED",
    "CANCELLED",
] as const;
export type OrderStatus = typeof ORDER_STATUS_LIST[number];

export interface Order{
    id: number;
    code: string;
    type: "NORMAL" | "AUCTION";

    productId: number;
    productName: string;
    imageUrl: string;
    brand: string;

    buyerId: number;
    buyerName: string;

    sellerId: number;
    sellerName: string;

    finalPrice: number;
    shippingFee: number;
    totalAmount: number;

    status: OrderStatus

    shippingAddress: string;
    buyerPhone: string;
    createdAt: string;
    updatedAt: string;
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
};
export const ORDER_TRANSITION_RULE: Record<OrderStatus, OrderStatus[]> = {
    AWAITING_PAYMENT: ["AWAITING_PAYMENT", "PAID", "CANCELLED"],
    PAID: ["PAID", "PROCESSING", "CANCELLED"],
    PROCESSING: ["PROCESSING", "SHIPPED", "CANCELLED"],
    SHIPPED: ["SHIPPED","DELIVERED"],
    DELIVERED: ["COMPLETED"],
    COMPLETED: [],
    DISPUTED: [],
    CANCELLED: [],
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
};