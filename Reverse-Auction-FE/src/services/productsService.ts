import type { Product } from "@/types/product";
import api from "@/utils/axios";
import type {Category} from "@/types/category.ts";

export const productService = {
    fetchProducts: async (): Promise<Product[]> => {
        const res = await api.get("/products/list");
        return res.data;
    },
    getAllCategories: async (): Promise<Category[]> => {
        const res = await api.get("/categories");
        return res.data;
    },
};