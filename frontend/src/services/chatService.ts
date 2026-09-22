import api from "@/lib/axios";
import type { Conversation, ConversationResponse, Message, ReadReceipt } from "@/types/chat";

export interface FetchMessagesResponse {
  messages: Message[];
  nextCursor: string | null;
}

const pageLimit = 50;

export const chatService = {
  async createConversation(type: "direct" | "group", memberIds: string[], name?: string): Promise<Conversation> {
    return (await api.post("/conversations", { type, memberIds, name })).data.conversation;
  },
  async markConversationRead(id: string): Promise<ReadReceipt> {
    const res = await api.patch("/conversations/" + id + "/read");
    return res.data;
  },
  async fetchConversation(): Promise<ConversationResponse> {
    const res = await api.get("/conversations");
    return res.data;
  },

  async fetchMessage(id: string, cursor?: string): Promise<FetchMessagesResponse> {
    const res = await api.get(`/conversations/${id}/messages`, { params: { limit: pageLimit, cursor } });
    return res.data;
  },

  async sendDirectMessage(
    recipientId: string,
    content: string = "",
    imgUrl?: string,
    conversationId?: string
  ) {
    const res = await api.post("/messages/direct", {
      recipientId,
      content,
      imgUrl,
      conversationId,
    });

    return res.data.message;
  },

  async sendGroupMessage(
    conversationId: string,
    content: string = "",
    imgUrl?: string
  ) {
    const res = await api.post("/messages/group", {
      conversationId,
      content,
      imgUrl,
    });
    return res.data.message;
  },
};
