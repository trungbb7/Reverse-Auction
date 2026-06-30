import type { User } from "@/types/user";
import type { Transaction } from "@/types/transaction";
import type { UserAddress } from "@/types/address";
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

  submitKyc: async (
    data: Pick<
      User,
      "identityNumber" | "frontIdentity" | "backIdentity" | "businessLicense"
    >,
  ): Promise<User> => {
    const res = await api.post("/users/kyc", data);
    return res.data;
  },

  // Wallet and Transactions
  fetchTransactions: async (): Promise<Transaction[]> => {
    const res = await api.get("/transactions/me");
    return res.data;
  },

  instantDeposit: async (amount: number): Promise<Transaction> => {
    const res = await api.post("/transactions/deposit/instant", null, {
      params: { amount },
    });
    return res.data;
  },

  initiateVNPayDeposit: async (amount: number, bankCode?: string): Promise<Transaction> => {
    const res = await api.post("/transactions/deposit/vnpay", null, {
      params: { amount, bankCode },
    });
    return res.data;
  },

  confirmTopup: async (txnRef: string, status: string): Promise<Transaction> => {
    const res = await api.post("/transactions/deposit/callback", null, {
      params: { txnRef, status },
    });
    return res.data;
  },

  requestWithdrawal: async (data: {
    amount: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }): Promise<Transaction> => {
    const res = await api.post("/transactions/withdraw", data);
    return res.data;
  },

  // Admin wallet operations
  fetchPendingWithdrawals: async (): Promise<Transaction[]> => {
    const res = await api.get("/admin/transactions/withdrawals/pending");
    return res.data;
  },

  approveWithdrawal: async (id: number): Promise<Transaction> => {
    const res = await api.post(`/admin/transactions/withdrawals/${id}/approve`);
    return res.data;
  },

  rejectWithdrawal: async (id: number, reason?: string): Promise<Transaction> => {
    const res = await api.post(`/admin/transactions/withdrawals/${id}/reject`, null, {
      params: { reason },
    });
    return res.data;
  },

  // Email Update
  requestEmailUpdate: async (newEmail: string): Promise<void> => {
    await api.post("/users/me/request-email-update", null, {
      params: { newEmail },
    });
  },

  confirmEmailUpdate: async (code: string): Promise<void> => {
    await api.post("/users/me/confirm-email-update", null, {
      params: { code },
    });
  },

  // Multiple Addresses
  fetchAddresses: async (): Promise<UserAddress[]> => {
    const res = await api.get("/users/me/addresses");
    return res.data;
  },

  addAddress: async (data: Omit<UserAddress, "id">): Promise<UserAddress> => {
    const res = await api.post("/users/me/addresses", data);
    return res.data;
  },

  updateAddress: async (id: number, data: Partial<UserAddress>): Promise<UserAddress> => {
    const res = await api.put(`/users/me/addresses/${id}`, data);
    return res.data;
  },

  deleteAddress: async (id: number): Promise<void> => {
    await api.delete(`/users/me/addresses/${id}`);
  },

  setDefaultAddress: async (id: number): Promise<void> => {
    await api.put(`/users/me/addresses/${id}/default`);
  },
};
