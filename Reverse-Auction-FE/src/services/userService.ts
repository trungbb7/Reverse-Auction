import type { User } from "@/types/user";
import api from "@/utils/axios";

export const userService = {
    fetchUser: async (): Promise<User> => {
        const res = await api.get("/users/me");
        return res.data;
    },

    updateUser: async (data: User): Promise<User> => {
        const res = await api.put("/users/me", data);
        return res.data;
    },

    topupBalance: async (amount: number): Promise<User> => {
        const res = await api.post("/users/me/topup", null, {
            params: { amount }
        });
        return res.data;
    },
};
