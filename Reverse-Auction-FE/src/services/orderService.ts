import api from "@/utils/axios";
import type { Order, CheckoutRequest, CheckoutResponse } from "@/types/orders";

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

  getSellerOrders: async (): Promise<Order[]> => {
    const res = await api.get("/orders/seller");
    return res.data;
  },

  updateStatus: async (orderId: number, status: Order["status"]): Promise<Order> => {
    const res = await api.put(`/orders/${orderId}/status`, null, {
      params: { status },
    });
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
    createCheckout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
        const response = await api.post("/checkout/checkout", data);
        return response.data;
    },

    paySessionWithBalance: async (sessionId: number): Promise<{ success: boolean }> => {
        const res = await api.post(`/checkout/session/${sessionId}/pay-balance`);
        return res.data;
    },

  /** Xác nhận kết quả thanh toán (callback từ VNPay hoặc thủ công sandbox) */
  confirmPayment: async (orderId: number, status: "success" | "fail"): Promise<void> => {
    await api.post("/payments/vnpay/callback", null, {
      params: { orderId, status },
    });
  },
    confirmPaymentSession: async (sessionCode: string, status: "success" | "fail"): Promise<void> => {
        await api.post("/checkout/vnpay/callback", null, {
            params: { sessionCode, status },
        });
    },

  updateShippingInfo: async (orderId: number, address: string, phone: string): Promise<Order> => {
    const res = await api.put(`/orders/${orderId}/shipping`, null, {
      params: { address, phone }
    });
    return res.data;
  },

  payWithBalance: async (orderId: number): Promise<Order> => {
    const res = await api.post(`/orders/${orderId}/pay-with-balance`);
    return res.data;
  },

  getSellerStats: async (): Promise<any> => {
    const res = await api.get("/stats/seller");
    return res.data;
  },
};