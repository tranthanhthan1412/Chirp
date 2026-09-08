import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatState } from "@/types/store";
import { chatService } from "@/services/chatService";


export const useChatStore = create<ChatState>()(
    persist(
        (set) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            loading: false,

            setActiveConversationId: (id: string | null) => set({ activeConversationId: id }),
            reset: () => set({
                conversations: [],
                messages: {},
                activeConversationId: null,
                loading: false,
            }),
            fetchConversations: async () => {
                try {
                    set({ loading: true });
                    const { conversations } = await chatService.fetchConversation();
                    set({ conversations, loading: false });
                } catch (error) {
                    console.error("Lỗi xảy ra khi fetchConversation:", error);
                    set({ loading: false });
                }
            }
        }), {
        name: "chat-storage",
        partialize: (state) => ({ conversations: state.conversations })
    }))

