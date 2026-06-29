import api from "@/utils/axios";
import type { AiChatRequest, AiChatResponse } from "@/types/aiChat";

export const aiChatService = {
  sendMessage: async (payload: AiChatRequest): Promise<AiChatResponse> => {
    const res = await api.post("/ai-chat/messages", payload);
    return res.data;
  },
};
