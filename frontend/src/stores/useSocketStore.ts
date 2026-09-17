import { create } from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthstore";
import type { SocketState } from "@/types/store";
import { useChatStore } from "./useChatstore";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.DEV ? "http://localhost:5001" : "/");

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,
    onlineUsers: [],

    connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;

        if (!accessToken || existingSocket?.connected) {
            return;
        }

        if (existingSocket) {
            existingSocket.disconnect();
        }

        const socket = io(SOCKET_URL, {
            auth: { token: accessToken },
            withCredentials: true,
        });

        set({ socket });

        socket.on("connect", () => {
            console.log("Connected to WebSocket server. ID: " + socket.id);
            const chat = useChatStore.getState();
            void chat.fetchConversations().then(() => {
                const activeId = useChatStore.getState().activeConversationId;
                if (activeId) void useChatStore.getState().markConversationRead(activeId);
            });
            for (const id of Object.keys(chat.messages)) void chat.fetchMessages(id, true);
        });

        socket.on("connect_error", (error) => {
            console.error("WebSocket connection error:", error.message);
        });

        // get list online users
        socket.on("online-users", (userIds: string[]) => {
            set({ onlineUsers: userIds });
        });

        socket.on("conversation-read", receipt => {
            useChatStore.getState().applyReadReceipt(receipt);
        });

        // new message
        socket.on("new-message", ({ message, conversation, unreadCount, unreadCounts }) => {
            useChatStore.getState().addMessage(message);

            const senderId =
                conversation?.lastMessage?.sender?._id ||
                conversation?.lastMessage?.senderId ||
                message.senderId;

            const lastMessage = conversation?.lastMessage
                ? {
                    _id: conversation.lastMessage._id || message._id,
                    content: conversation.lastMessage.content ?? message.content ?? "",
                    createdAt: conversation.lastMessage.createdAt || message.createdAt,
                    sender: conversation.lastMessage.sender || {
                        _id: senderId,
                        displayName: "",
                        avatarUrl: null,
                    },
                }
                : null;

            const counts = unreadCounts || unreadCount || {};
            const updatedConversation = {
                ...conversation,
                _id: conversation?._id || message.conversationId,
                lastMessage: lastMessage,
                unreadCount: counts,
                unreadCounts: counts,
            };

            useChatStore.getState().updateConversation(updatedConversation);
            if (useChatStore.getState().activeConversationId === message.conversationId && message.senderId !== useAuthStore.getState().user?._id) {
                void useChatStore.getState().markConversationRead(message.conversationId);
            }
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.removeAllListeners();
            socket.disconnect();
            set({ socket: null, onlineUsers: [] });
        }
    }
}));
