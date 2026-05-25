import type { Category } from "@/types/category";
import api from "@/utils/axios";

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data;
  },
};
