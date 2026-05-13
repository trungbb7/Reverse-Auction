import api from "@/utils/axios";
import type { Order } from "@/types/orders";

export interface PaymentResult {
  paymentId: number;
  orderId: number;
  amount: number;
  bankCode: string;
  paymentUrl: string;
  createdAt: string;
}

export const orderService = {
  getMyOrders: async (): Promise<Order[]> => {
    const res = await api.get("/orders");
    return res.data;
  },

  updateStatus: async (orderId: number, status: Order["status"]): Promise<Order> => {
    const res = await api.put(`/orders/${orderId}/status`, status);
    return res.data;
  },

  getOrderDetail: async (id: number): Promise<Order> => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },

  /** Tạo phiên thanh toán VNPay, nhận về paymentUrl */
  createPayment: async (
    orderId: number,
    amount: number,
    bankCode: string
  ): Promise<PaymentResult> => {
    const res = await api.post("/payments/vnpay", { orderId, amount, bankCode });
    return res.data;
  },

  /** Xác nhận kết quả thanh toán (callback từ VNPay hoặc thủ công sandbox) */
  confirmPayment: async (orderId: number, status: "success" | "fail"): Promise<void> => {
    await api.post("/payments/vnpay/callback", null, {
      params: { orderId, status },
    });
  },
};