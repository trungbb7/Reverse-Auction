import api from "@/utils/axios";
import type { Order } from "@/types/orders";

export const orderService = {
    getMyOrders: async (): Promise<Order[]> => {
        const res = await api.get("/orders");
        return res.data;
    },
    updateStatus: async (orderId: number, status: Order["status"]): Promise<Order> => {
        const res = await api.put(`/orders/${orderId}/status`, status);
        return res.data;
    }
};