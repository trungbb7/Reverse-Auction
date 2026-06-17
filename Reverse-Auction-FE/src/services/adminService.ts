import api from "@/utils/axios";
import type { User } from "@/types/user";
import type { Category } from "@/types/category";

export const adminService = {
    getAllUsers: async (): Promise<User[]> => {
        const res = await api.get("/admin/users");
        return res.data;
    },

    toggleUserBlock: async (userId: number): Promise<void> => {
        await api.patch(`/admin/users/${userId}/toggle-block`);
    },

    verifyKyc: async (userId: number, status: string, message?: string): Promise<User> => {
        const res = await api.patch(`/admin/users/${userId}/kyc`, null, {
            params: { status, message }
        });
        return res.data;
    },

    // Category Management
    getAllCategories: async (): Promise<Category[]> => {
        const res = await api.get("/admin/categories");
        return res.data;
    },

    createCategory: async (category: Omit<Category, "id">): Promise<Category> => {
        const res = await api.post("/admin/categories", category);
        return res.data;
    },

    updateCategory: async (id: number, category: Omit<Category, "id">): Promise<Category> => {
        const res = await api.put(`/admin/categories/${id}`, category);
        return res.data;
    },

    deleteCategory: async (id: number): Promise<void> => {
        await api.delete(`/admin/categories/${id}`);
    },

    // Auction Management
    getAllAuctions: async (page = 0, size = 10): Promise<any> => {
        const res = await api.get(`/admin/auctions?page=${page}&size=${size}`);
        return res.data;
    },

    // Order Management
    getAllOrders: async (): Promise<any[]> => {
        const res = await api.get("/admin/orders");
        return res.data;
    },
};
