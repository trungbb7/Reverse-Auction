export interface ChatUser {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  phone?: string;
}

export interface ExternalConversation {
  conversationId: number;
  participantId: number;
  participantName: string;
  participantEmail: string;
  participantRole: string;
  lastMessage?: string | null;
  lastMessageAt?: string | null;
  createdDate: string;
  updatedDate: string;
  complaintChat?: boolean;
}

export interface ExternalMessage {
  msgId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  type?: "text" | "image" | "video" | null;
  url?: string | null;
  time: string;
}

export interface SendExternalMessageRequest {
  receiverId: number;
  content: string;
  type?: "text" | "image" | "video";
  url?: string;
  complaintChat?: boolean;
}
