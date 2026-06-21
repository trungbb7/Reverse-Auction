import api from "@/utils/axios";

export interface CreateComplaintResponse {
  complaintId: number;
  orderId: number;
  status: string;
  createdAt: string;
}

export interface CreateComplaintPayload {
  orderId: number;
  reason: string;
  evidenceImages?: File[];
  evidenceUrls?: string[];
}

export interface Complaint {
  complaintId: number;
  orderId: number;
  orderCode?: string;
  productName?: string;
  totalAmount?: number;
  buyerId: number;
  buyerName: string;
  sellerId: number;
  sellerName: string;
  reason: string;
  evidenceUrls: string[];
  status: string;
  sellerAction?: string | null;
  sellerMessage?: string | null;
  sellerEvidence?: string | null;
  verdict?: string | null;
  adminNote?: string | null;
  finalAction?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

export type ComplaintResponse = Complaint;

export interface RespondComplaintPayload {
  action: string;
  sellerMessage: string;
  sellerEvidence: string;
}

export interface RespondComplaintResponse {
  complaintId: number;
  status: string;
  sellerAction: string;
  sellerMessage: string;
  sellerEvidence: string;
  updatedAt: string;
}

export interface ResolveComplaintPayload {
  verdict: string;
  adminNote: string;
}

export interface ResolveComplaintResponse {
  complaintId: number;
  status: string;
  finalAction: string;
  resolvedAt: string;
}

export const complaintService = {
  createComplaint: async (
    payload: CreateComplaintPayload,
  ): Promise<CreateComplaintResponse> => {
    // If we have images, we MUST use FormData
    if (payload.evidenceImages && payload.evidenceImages.length > 0) {
      const formData = new FormData();
      formData.append("orderId", String(payload.orderId));
      formData.append("reason", payload.reason);

      payload.evidenceImages.forEach((file) => {
        formData.append("evidenceImages", file);
      });

      const res = await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    }

    // Otherwise, use JSON endpoint
    const res = await api.post("/complaints", {
      orderId: payload.orderId,
      reason: payload.reason,
      evidenceUrls: payload.evidenceUrls || [],
    });

    return res.data;
  },

  listComplaints: async (): Promise<Complaint[]> => {
    const res = await api.get("/complaints");
    return res.data;
  },

  respondComplaint: async (
    complaintId: number,
    payload: RespondComplaintPayload,
  ): Promise<RespondComplaintResponse> => {
    const res = await api.patch(`/complaints/${complaintId}/respond`, payload);
    return res.data;
  },

  resolveComplaint: async (
    complaintId: number,
    payload: ResolveComplaintPayload,
  ): Promise<ResolveComplaintResponse> => {
    const res = await api.patch(`/admin/complaints/${complaintId}/resolve`, payload);
    return res.data;
  },
};
