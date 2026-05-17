import type { Product } from "@/types/product";
import api from "@/utils/axios";

export const productService = {
    fetchMyProducts: async (): Promise<Product[]> => {
        const res = await api.get("/products/list");
        return res.data;
    },
};