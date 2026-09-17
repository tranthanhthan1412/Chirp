import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatState } from "@/types/store";
import type { Conversation, Message } from "@/types/chat";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "./useAuthstore";


const mergeMessages = (...lists: Message[][]) =>
    [...new Map(lists.flat().map(message => [message._id, message])).values()]
        .sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
const newer = (a: Conversation, b: Partial<Conversation>) =>
    Date.parse(a.lastMessage?.createdAt || a.lastMessageAt || "") >
    Date.parse(b.lastMessage?.createdAt || b.lastMessageAt || "");

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            convoLoading: false,
            messageLoading: false,

            setActiveConversationId: (id: string | null) => {
                set({ activeConversationId: id });
                if (id) void get().markConversationRead(id);
            },
            applyReadReceipt: ({ conversationId, userId, lastMessageId }) => {
                set(state => ({ conversations: state.conversations.map(c => {
                    if (c._id !== conversationId || (c.lastMessage?._id ?? null) !== lastMessageId) return c;
                    return {
                        ...c,
                        unreadCounts: { ...c.unreadCounts, [userId]: 0 },
                        seenBy: [...(c.seenBy ?? []).filter(u => u._id !== userId), { _id: userId }],
                    };
                }) }));
            },
            markConversationRead: async (id) => {
                const user = useAuthStore.getState().user;
                if (!user) return;
                const previous = get().conversations.find(c => c._id === id);
                get().applyReadReceipt({ conversationId: id, userId: user._id, lastMessageId: previous?.lastMessage?._id ?? null });
                try {
                    get().applyReadReceipt(await chatService.markConversationRead(id));
                } catch (error) {
                    console.error("Failed to mark conversation read:", error);
                    if (previous) set(state => ({ conversations: state.conversations.map(c =>
                        c._id === id && c.lastMessage?._id === previous.lastMessage?._id
                            ? { ...c, unreadCounts: { ...c.unreadCounts, [user._id]: previous.unreadCounts?.[user._id] ?? 0 }, seenBy: previous.seenBy }
                            : c
                    ) }));
                    toast.error("Kh?ng th? l?u tr?ng th?i ?? ??c. H?y m? l?i cu?c tr? chuy?n ?? th? l?i.");
                }
            },
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
                    set(state => ({
                        conversations: (conversations || []).map(c => {
                            const current = state.conversations.find(item => item._id === c._id);
                            if (current && newer(current, c)) return { ...c, ...current };
                            const userId = useAuthStore.getState().user?._id;
                            if (current && userId && current.lastMessage?._id === c.lastMessage?._id && current.seenBy?.some(u => u._id === userId)) {
                                return { ...c, unreadCounts: { ...c.unreadCounts, [userId]: 0 }, seenBy: current.seenBy };
                            }
                            return c;
                        }).concat(state.conversations.filter(c => !(conversations || []).some(item => item._id === c._id)))
                            .sort((a, b) => Date.parse(b.lastMessageAt) - Date.parse(a.lastMessageAt)),
                        convoLoading: false,
                    }));
                } catch (error) {
                    console.error("Lỗi xảy ra khi fetchConversation:", error);
                    set({ convoLoading: false });
                }
            },
            fetchMessages: async (conversationId, refresh = false) => {
                const { activeConversationId, messages } = get();
                const { user } = useAuthStore.getState();

                const convoId = conversationId ?? activeConversationId;
                if (!convoId || !user) return;

                const current = messages?.[convoId];
                const nextCursor = refresh ? "" : current?.nextCursor === undefined ? "" : current?.nextCursor;

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
                        const merged = mergeMessages(processed, prev);

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
                        const convoExists = state.conversations.some((c) => c._id === convoId);

                        const updatedConvos = state.conversations.map((c) =>
                            c._id === convoId && !newer(c, { lastMessageAt: message.createdAt })
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

                        if (!convoExists) {
                            get().fetchConversations();
                        }

                        updatedConvos.sort((a, b) => {
                            const timeA = new Date(a.lastMessage?.createdAt || a.lastMessageAt || a.updatedAt || 0).getTime();
                            const timeB = new Date(b.lastMessage?.createdAt || b.lastMessageAt || b.updatedAt || 0).getTime();
                            return timeB - timeA;
                        });

                        return {
                            activeConversationId: state.activeConversationId || convoId,
                            conversations: updatedConvos,
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: mergeMessages(prevItems, [processedMessage]),
                                    hasMore: state.messages[convoId]?.hasMore ?? false,
                                    nextCursor: state.messages[convoId]?.nextCursor,
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
                        const convoExists = state.conversations.some((c) => c._id === convoId);

                        const updatedConvos = state.conversations.map((c) =>
                            c._id === convoId && !newer(c, { lastMessageAt: message.createdAt })
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

                        if (!convoExists) {
                            get().fetchConversations();
                        }

                        updatedConvos.sort((a, b) => {
                            const timeA = new Date(a.lastMessage?.createdAt || a.lastMessageAt || a.updatedAt || 0).getTime();
                            const timeB = new Date(b.lastMessage?.createdAt || b.lastMessageAt || b.updatedAt || 0).getTime();
                            return timeB - timeA;
                        });

                        return {
                            conversations: updatedConvos,
                            messages: {
                                ...state.messages,
                                [convoId]: {
                                    items: mergeMessages(prevItems, [processedMessage]),
                                    hasMore: state.messages[convoId]?.hasMore ?? false,
                                    nextCursor: state.messages[convoId]?.nextCursor,
                                },
                            },
                        };
                    });
                } catch (error) {
                    console.error("Lỗi xảy ra khi sendGroupMessage:", error);
                }
            },
            addMessage: async (message) => {
                const user = useAuthStore.getState().user;
                const convoId = message.conversationId;
                set(state => ({ messages: {
                    ...state.messages,
                    [convoId]: {
                        items: mergeMessages(state.messages[convoId]?.items ?? [], [
                            { ...message, isOwn: message.senderId === user?._id },
                        ]),
                        hasMore: state.messages[convoId]?.hasMore ?? true,
                        nextCursor: state.messages[convoId]?.nextCursor,
                    },
                } }));
            },
            updateConversation: (conversation) => {
                set((state) => {
                    const exists = state.conversations.some((c) => c._id === conversation._id);
                    let updatedConvos: Conversation[];

                    if (exists) {
                        updatedConvos = state.conversations.map((c) =>
                            c._id === conversation._id && !newer(c, conversation) ? { ...c, ...conversation } : c
                        );
                    } else {
                        updatedConvos = conversation.participants && conversation.type ? [conversation as Conversation, ...state.conversations] : state.conversations;
                        get().fetchConversations();
                    }

                    updatedConvos.sort((a, b) => {
                        const timeA = new Date(a.lastMessage?.createdAt || a.lastMessageAt || a.updatedAt || 0).getTime();
                        const timeB = new Date(b.lastMessage?.createdAt || b.lastMessageAt || b.updatedAt || 0).getTime();
                        return timeB - timeA;
                    });

                    return {
                        conversations: updatedConvos,
                    };
                });
            },
        }),
        {
            name: "chat-storage",
            partialize: (state) => ({ conversations: state.conversations }),
        }
    )
);


