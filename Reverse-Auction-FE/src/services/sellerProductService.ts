import type { Product, ProductRequest } from "@/types/product";
import api from "@/utils/axios";
import type {Category} from "@/types/category.ts";

export const sellerProductService = {
    fetchMyProducts: async (): Promise<Product[]> => {
        const res = await api.get("/seller/products/list");
        return res.data;
    },
    getAllCategories: async (): Promise<Category[]> => {
        const res = await api.get("/categories");
        return res.data;
    },
    createProduct: async (data: ProductRequest) => {
        const res = await api.post("/seller/products", data);
        return res.data;
    },

    updateProduct: async (id: number, data: ProductRequest): Promise<Product> => {
        const res = await api.put(`/seller/products/${id}`, data);
        return res.data;
    },

    deleteProduct: async (id: number): Promise<void> => {
        await api.delete(`/seller/products/${id}`);
    },
};