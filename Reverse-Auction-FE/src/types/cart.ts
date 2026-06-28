export interface CartItem {
    id: number;
    productId: number;
    shopId: number;
    shopName: string;
    productName: string;
    imageUrl: string;
    price: number;
    quantity: number;
    selected?: boolean;
}

export interface CartResponse {
    items: CartItem[];
}
export interface CartGroupedBySeller {
    shopId: number;
    shopName: string;
    items: CartItem[];
    subtotal: number;
    shippingFee: number;
    totalAmount: number;
}