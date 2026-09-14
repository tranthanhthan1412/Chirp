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
            sendDirectMessage: async (recipientId, content, imgUrl) => {
                try {
                    const { activeConversationId } = get();
                    const { user } = useAuthStore.getState();
                    const message = await chatService.sendDirectMessage(
                        recipientId,
                        content,
                        imgUrl,
                        activeConversationId || undefined
                    );

                    if (!message) return;

                    const convoId = message.conversationId;
                    const processedMessage = {
                        ...message,
                        isOwn: user ? message.senderId === user._id : true,
                    };

                    set((state) => {
                        const prevItems = state.messages[convoId]?.items ?? [];
                        const updatedConvos = state.conversations.map((c) =>
                            c._id === convoId
                                ? {
                                    ...c,
                                    lastMessage: {
                                        _id: message._id,
                                        content: message.content ?? "",
                                        createdAt: message.createdAt,
                                        sender: {
                                            _id: user?._id ?? message.senderId,
                                            displayName: user?.displayName ?? "",
                                            avatarUrl: user?.avatarUrl,
                                        },
                                    },
                                    lastMessageAt: message.createdAt,
                                    seenBy: [],
                                }
                                : c
                        );

                        return {
                            activeConversationId: state.activeConversationId || convoId,
                            conversations: updatedConvos,
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: [...prevItems, processedMessage],
                                    hasMore: state.messages[convoId]?.hasMore ?? false,
                                    nextCursor: state.messages[convoId]?.nextCursor ?? null,
                                },
                            },
                        };
                    });
                } catch (error) {
                    console.error("Lỗi xảy ra khi sendDirectMessage:", error);
                }
            },
            sendGroupMessage: async (conversationId, content, imgUrl) => {
                try {
                    const { user } = useAuthStore.getState();
                    const message = await chatService.sendGroupMessage(
                        conversationId,
                        content,
                        imgUrl
                    );

                    if (!message) return;

                    const convoId = conversationId;
                    const processedMessage = {
                        ...message,
                        isOwn: user ? message.senderId === user._id : true,
                    };

                    set((state) => {
                        const prevItems = state.messages[convoId]?.items ?? [];
                        const updatedConvos = state.conversations.map((c) =>
                            c._id === convoId
                                ? {
                                    ...c,
                                    lastMessage: {
                                        _id: message._id,
                                        content: message.content ?? "",
                                        createdAt: message.createdAt,
                                        sender: {
                                            _id: user?._id ?? message.senderId,
                                            displayName: user?.displayName ?? "",
                                            avatarUrl: user?.avatarUrl,
                                        },
                                    },
                                    lastMessageAt: message.createdAt,
                                    seenBy: [],
                                }
                                : c
                        );

                        return {
                            conversations: updatedConvos,
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: [...prevItems, processedMessage],
                                    hasMore: state.messages[convoId]?.hasMore ?? false,
                                    nextCursor: state.messages[convoId]?.nextCursor ?? null,
                                },
                            },
                        };
                    });
                } catch (error) {
                    console.error("Lỗi xảy ra khi sendGroupMessage:", error);
                }
            },
        }),
        {
            name: "chat-storage",
            partialize: (state) => ({ conversations: state.conversations }),
        }
    )
);


