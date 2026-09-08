import api from "@/lib/axios";
import type { ConversationResponse } from "@/types/chat";

export const chatService = {
  async fetchConversation(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },
};
