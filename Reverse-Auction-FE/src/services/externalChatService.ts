import api from "@/utils/axios";
import type {
  ChatUser,
  ExternalConversation,
  ExternalMessage,
  SendExternalMessageRequest,
} from "@/types/externalChat";

export const externalChatService = {
  ensureConversation: async (
    receiverId: number,
  ): Promise<ExternalConversation> => {
    const res = await api.post("/external-chats/conversations/ensure", {
      receiverId,
    });
    return res.data;
  },

  fetchContacts: async (): Promise<ChatUser[]> => {
    const res = await api.get("/users/chat-contacts");
    return res.data;
  },

  fetchConversations: async (): Promise<ExternalConversation[]> => {
    const res = await api.get("/external-chats/conversations");
    return res.data;
  },

  fetchMessages: async (conversationId: number): Promise<ExternalMessage[]> => {
    const res = await api.get(
      `/external-chats/conversations/${conversationId}/messages`,
    );
    return res.data;
  },

  sendMessage: async (
    payload: SendExternalMessageRequest,
  ): Promise<ExternalMessage> => {
    const res = await api.post("/external-chats/messages", payload);
    return res.data;
  },
};
