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

    submitKyc: async (formData: FormData): Promise<User> => {
        const res = await api.post("/users/kyc", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    },
};
