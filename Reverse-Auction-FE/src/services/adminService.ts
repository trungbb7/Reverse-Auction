import api from "@/utils/axios";
import type { User } from "@/types/user";

export const adminService = {
    getAllUsers: async (): Promise<User[]> => {
        const res = await api.get("/admin/users");
        return res.data;
    },

    toggleUserBlock: async (userId: number): Promise<void> => {
        await api.patch(`/admin/users/${userId}/toggle-block`);
    },
};
