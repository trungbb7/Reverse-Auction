import api from "@/utils/axios";

export interface CreateComplaintRequest {
  orderId: number;
  reason: string;
  evidenceUrls: string[];
}

export interface RespondComplaintRequest {
  action: string;
  sellerMessage: string;
  sellerEvidence: string;
}

export interface ResolveComplaintRequest {
  verdict: string;
  adminNote: string;
}

export interface ComplaintResponse {
  complaintId: number;
  orderId: number;
  orderCode: string;
  productName: string;
  buyerName: string;
  buyerId: number;
  buyerEmail: string;
  sellerName: string;
  sellerId: number;
  sellerEmail: string;
  orderType: string;
  finalPrice: number;
  shippingFee: number;
  totalAmount: number;
  shippingAddress: string;
  buyerPhone: string;
  reason: string;
  evidenceUrls: string[];
  status: string;
  sellerAction: string | null;
  sellerMessage: string | null;
  sellerEvidence: string | null;
  verdict: string | null;
  adminNote: string | null;
  finalAction: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export const complaintService = {
  createComplaint: async (request: CreateComplaintRequest): Promise<any> => {
    const res = await api.post("/complaints", request);
    return res.data;
  },

  listComplaints: async (): Promise<ComplaintResponse[]> => {
    const res = await api.get("/complaints");
    return res.data;
  },

  respondComplaint: async (id: number, request: RespondComplaintRequest): Promise<any> => {
    const res = await api.patch(`/complaints/${id}/respond`, request);
    return res.data;
  },

  resolveComplaint: async (id: number, request: ResolveComplaintRequest): Promise<any> => {
    const res = await api.patch(`/admin/complaints/${id}/resolve`, request);
    return res.data;
  },
};
