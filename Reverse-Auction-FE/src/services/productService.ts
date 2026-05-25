import api from "@/utils/axios";
import { publicApi } from "@/utils/axios";
import type { PageResponse, Product, ProductRequest } from "@/types/product";

export const productService = {
  getPublicProducts: async (page = 0, size = 8): Promise<PageResponse<Product>> => {
    const res = await publicApi.get("/public/products", {
      params: { page, size, sort: "id,desc" },
    });
    return res.data;
  },

  getMyProducts: async (listedForSale: boolean, page = 0, size = 10): Promise<PageResponse<Product>> => {
    const res = await api.get("/seller/products", {
      params: { listedForSale, page, size, sort: "id,desc" },
    });
    return res.data;
  },

  getMyProduct: async (id: number): Promise<Product> => {
    const res = await api.get(`/seller/products/${id}`);
    return res.data;
  },

  getPublicProduct: async (id: number): Promise<Product> => {
    const res = await publicApi.get(`/public/products/${id}`);
    return res.data;
  },

  createProduct: async (payload: ProductRequest): Promise<Product> => {
    const res = await api.post("/seller/products", payload);
    return res.data;
  },

  updateProduct: async (id: number, payload: ProductRequest): Promise<Product> => {
    const res = await api.put(`/seller/products/${id}`, payload);
    return res.data;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/seller/products/${id}`);
  },
};
