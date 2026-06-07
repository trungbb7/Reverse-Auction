export const ProductStatus = {
    ACTIVE: "ACTIVE",
    HIDDEN: "HIDDEN",
    OUT_OF_STOCK: "OUT_OF_STOCK",
} as const;

export type ProductStatus =
    typeof ProductStatus[keyof typeof ProductStatus];

export interface Product {
    id: number;

    name: string;
    sku?: string;
    description?: string;
    specifications?: string;

    brand?: string;
    model?: string;

    imageUrl?: string;
    imageUrls?: string[];

    categoryId: number;
    categoryName: string;

    price: number;

    stockQuantity: number;
    rating: number;

    status: ProductStatus;

    sellerId: number;
    sellerName: string;

    createdAt: string;
    updatedAt: string;
}
export interface ProductRequest {
    name: string;
    description?: string;
    specifications?: string;

    brand?: string;
    model?: string;

    imageUrl?: string;
    imageUrls?: string[];

    categoryId: number;

    price: number;
    stockQuantity: number;
}