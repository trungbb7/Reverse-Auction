import type {Category} from "@/types/category.ts";

export const ProductStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    ACTIVE: "ACTIVE",
    REJECTED: "REJECTED",
    HIDDEN: "HIDDEN",
    SOLD_OUT: "SOLD_OUT",
} as const;

export type ProductStatus =
    typeof ProductStatus[keyof typeof ProductStatus];

export interface Product {
    id: number;

    name: string;
    sku: string;

    description?: string;
    specifications?: string;

    brand?: string;
    model?: string;

    imageUrl?: string;

    category: Category;

    price: string;

    stockQuantity: number;
    status: ProductStatus;

    sellerId: number;
    sellerName: string;

    viewCount: number;
    ratingAverage: number;

    createdAt: string;
    updatedAt: string;
}