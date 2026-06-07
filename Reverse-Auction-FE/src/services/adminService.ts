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

    getAuctionDetail: async (id: number): Promise<any> => {
        const res = await api.get(`/admin/auctions/${id}`);
        return res.data;
    },

    cancelAuction: async (auctionId: number): Promise<any> => {
        const res = await api.patch(`/auctions/${auctionId}/status`, null, {
            params: { status: "CANCELLED" }
        });
        return res.data;
    },

    // Order Management
    getAllOrders: async (): Promise<any[]> => {
        const res = await api.get("/orders/admin");
        return res.data;
    },

    getAdminStats: async (): Promise<any> => {
        const res = await api.get("/stats/admin");
        return res.data;
    },

    getCommissionRate: async (): Promise<number> => {
        const res = await api.get("/admin/settings/commission-rate");
        return res.data;
    },

    updateCommissionRate: async (rate: number): Promise<number> => {
        const res = await api.put("/admin/settings/commission-rate", null, {
            params: { rate }
        });
        return res.data;
    },
};
