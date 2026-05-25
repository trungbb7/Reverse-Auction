import api from "@/utils/axios";
import type { Complaint, CreateComplaintResponse } from "@/types/complaint";

export interface CreateComplaintPayload {
  orderId?: number | null;
  content: string;
  attachments?: File[];
}

export interface UpdateComplaintStatusPayload {
  status: Complaint["status"];
}

const toComplaintFormData = (payload: CreateComplaintPayload) => {
  const formData = new FormData();
  formData.append("content", payload.content);

  if (payload.orderId !== undefined && payload.orderId !== null && !Number.isNaN(payload.orderId)) {
    formData.append("orderId", String(payload.orderId));
  }

  payload.attachments?.forEach((file) => {
    formData.append("attachments", file);
  });

  return formData;
};

export const complaintService = {
  createComplaint: async (
    payload: CreateComplaintPayload,
  ): Promise<CreateComplaintResponse> => {
    const res = await api.post("/complaints", toComplaintFormData(payload), {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  fetchMyComplaints: async (): Promise<Complaint[]> => {
    const res = await api.get("/complaints/my");
    return res.data;
  },

  fetchComplaintDetail: async (id: number, isAdmin = false): Promise<Complaint> => {
    const endpoint = isAdmin ? `/admin/complaints/${id}` : `/complaints/${id}`;
    const res = await api.get(endpoint);
    return res.data;
  },

  fetchAllComplaints: async (): Promise<Complaint[]> => {
    const res = await api.get("/admin/complaints");
    return res.data;
  },

  updateComplaintStatus: async (
    id: number,
    payload: UpdateComplaintStatusPayload,
  ): Promise<Complaint> => {
    const res = await api.put(`/admin/complaints/${id}/status`, payload);
    return res.data;
  },
};
