import { chatService } from "@/services/chatService";
import { useChatStore } from "@/stores/useChatstore";

export async function openConversation(type: "direct" | "group", members: string[], name?: string) {
  const conversation = await chatService.createConversation(type, members, name);
  const chat = useChatStore.getState();
  // Thêm cuộc trò chuyện trước khi chọn để khung nhập tin đầu tiên có đủ participants.
  useChatStore.setState(state => ({ conversations: [conversation, ...state.conversations.filter(c => c._id !== conversation._id)] }));
  chat.setActiveConversationId(conversation._id);
  void chat.fetchMessages(conversation._id, true);
}
