export type ComplaintStatus = "PENDING" | "RECEIVED" | "PROCESSING" | "RESOLVED";

export interface Complaint {
  complaintId: number;
  buyerId: number;
  buyerName: string;
  orderId?: number | null;
  orderCode?: string | null;
  chatRoomId: number;
  content: string;
  attachmentUrls: string[];
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
}

export interface CreateComplaintResponse {
  complaintId: number;
  chatRoomId: number;
  status: ComplaintStatus;
  createdAt: string;
}
