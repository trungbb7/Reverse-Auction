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
}

export interface ExternalMessage {
  msgId: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  content: string;
  time: string;
}

export interface SendExternalMessageRequest {
  receiverId: number;
  content: string;
}
