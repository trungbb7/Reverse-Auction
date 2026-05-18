import type { Product, ProductRequest } from "@/types/product";
import api from "@/utils/axios";
import type {Category} from "@/types/category.ts";

export const productService = {
    fetchMyProducts: async (): Promise<Product[]> => {
        const res = await api.get("/products/list");
        return res.data;
    },
    getAllCategories: async (): Promise<Category[]> => {
        const res = await api.get("/categories");
        return res.data;
    },
    createProduct: async (data: ProductRequest) => {
        const res = await api.post("/products", data);
        return res.data;
    },

    updateProduct: async (id: number, data: ProductRequest): Promise<Product> => {
        const res = await api.put(`/products/${id}`, data);
        return res.data;
    },

    deleteProduct: async (id: number): Promise<void> => {
        await api.delete(`/products/${id}`);
    },
};