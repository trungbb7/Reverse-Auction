import type { Product } from "@/types/product";
import api from "@/utils/axios";
import type {Category} from "@/types/category.ts";

export const productService = {
    getProductById: async (id: string | number): Promise<Product> => {
        const res = await api.get(`/products/${id}`);
        return res.data;
    },
    fetchProducts: async (): Promise<Product[]> => {
        const res = await api.get("/products/list");
        return res.data;
    },
    getAllCategories: async (): Promise<Category[]> => {
        const res = await api.get("/categories");
        return res.data;
    },
    searchProducts: async (params: {
        keyword?: string;
        categoryId?: number;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        size?: number;
        sortBy?: string;
        sortDir?: string;
    }): Promise<{
        content: Product[];
        totalElements: number;
        totalPages: number;
        pageNo: number;
        pageSize: number;
        last: boolean;
    }> => {
        const res = await api.get("/products/search", { params });
        return res.data;
    },
};