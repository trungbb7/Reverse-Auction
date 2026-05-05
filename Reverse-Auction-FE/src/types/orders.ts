export interface Order{
    id: number;
    code: string;
    type: "NORMAL" | "AUCTION";

    productId: number;
    productName: string;

    buyerId: number;
    buyerName: string;

    sellerId: number;
    sellerName: string;

    finalPrice: number;
    shippingFee: number;
    totalAmount: number;

    status:
        | "AWAITING_PAYMENT"
        | "PAID"
        | "PROCESSING"
        | "SHIPPED"
        | "DELIVERED"
        | "COMPLETED"
        | "DISPUTED"
        | "CANCELLED";

    shippingAddress: string;
    createdAt: string;
    updatedAt: string;
}