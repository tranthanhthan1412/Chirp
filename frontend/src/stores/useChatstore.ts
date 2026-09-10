import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatState } from "@/types/store";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "./useAuthstore";


export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            convoLoading: false,
            messageLoading: false,

            setActiveConversationId: (id: string | null) => set({ activeConversationId: id }),
            reset: () =>
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    convoLoading: false,
                    messageLoading: false,
                }),
            fetchConversations: async () => {
                try {
                    set({ convoLoading: true });
                    const { conversations } = await chatService.fetchConversation();
                    set({ conversations: conversations || [], convoLoading: false });
                } catch (error) {
                    console.error("Lỗi xảy ra khi fetchConversation:", error);
                    set({ convoLoading: false });
                }
            },
            fetchMessages: async (conversationId) => {
                const { activeConversationId, messages } = get();
                const { user } = useAuthStore.getState();

                const convoId = conversationId ?? activeConversationId;
                if (!convoId || !user) return;

                const current = messages?.[convoId];
                const nextCursor = current?.nextCursor === undefined ? "" : current?.nextCursor;

                if (nextCursor === null) return;

                set({ messageLoading: true });
                try {
                    const { messages: fetched, nextCursor: cursor } = await chatService.fetchMessage(
                        convoId,
                        nextCursor || undefined
                    );

                    const processed = (fetched || []).map((m) => {
                        return {
                            ...m,
                            isOwn: m.senderId === user._id,
                        };
                    });
                    set((state) => {
                        const prev = state.messages[convoId]?.items ?? [];
                        const merged = prev.length > 0 ? [...processed, ...prev] : processed;

                        return {
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: merged,
                                    hasMore: Boolean(cursor),
                                    nextCursor: cursor ?? null,
                                },
                            },
                        };
                    });
                } catch (error) {
                    console.error("Lỗi xảy ra khi fetchMessages:", error);
                } finally {
                    set({ messageLoading: false });
                }
            },
        }),
        {
            name: "chat-storage",
            partialize: (state) => ({ conversations: state.conversations }),
        }
    )
);


