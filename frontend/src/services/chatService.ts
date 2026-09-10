import api from "@/lib/axios";
import type { ConversationResponse, Message } from "@/types/chat";

export interface FetchMessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}

const pageLimit = 50;

export const chatService = {
  async fetchConversation(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },

  async fetchMessage(id: string, cursor?: string): Promise<FetchMessagesResponse> {
    const res = await api.get(`/conversations/${id}/messages?limit=${pageLimit}${cursor ? `&cursor=${cursor}` : ''}`);
    return res.data;
  }
};

