import type { Socket } from "socket.io-client";
import type { Conversation, Message, ReadReceipt } from "./chat";
import type { User } from "./user";

export interface AuthState {
    accessToken: string | null;
    user: User | null;
    loading: boolean;

    setAccessToken: (accessToken: string) => void;
    clearState: () => void;

    signUp: (username: string, password: string, email: string, firstName: string, lastName: string) => Promise<void>;
    signIn: (username: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
    fetchMe: () => Promise<void>;
    refresh: () => Promise<void>;
}

export interface ThemeState {
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (dark: boolean) => void;
}

export interface ChatState {
    conversations: Conversation[];
    messages: Record<string, {
        items: Message[];
        hasMore: boolean; // infinite scroll
        nextCursor?: string | null; // phan trang
    }>;
    activeConversationId: string | null;
    convoLoading: boolean; // convo loading
    messageLoading: boolean;
    loadingMessages: Record<string, boolean>;
    messageErrors: Record<string, string | null>;
    markConversationRead: (id: string) => Promise<void>;
    applyReadReceipt: (receipt: ReadReceipt) => void;
    reset: () => void;
    setActiveConversationId: (id: string | null) => void;
    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId?: string, refresh?: boolean) => Promise<void>;
    sendDirectMessage: (recipientId: string, content: string, imgUrl?: string) => Promise<void>;
    sendGroupMessage: (conversationId: string, content: string, imgUrl?: string) => Promise<void>;
    // add message
    addMessage: (message: Message) => Promise<void>;


    // update convo
    updateConversation: (conversation: Partial<Conversation> & { _id: string }) => void;
}

export interface SocketState {
    socket: Socket | null;
    onlineUsers: string[];
    connectSocket: () => void;
    disconnectSocket: () => void;
}
