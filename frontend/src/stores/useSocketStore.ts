import { create } from "zustand";
import { io } from "socket.io-client";
import { useAuthStore } from "./useAuthstore";
import type { SocketState } from "@/types/store";

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL ||
    (import.meta.env.DEV ? "http://localhost:5001" : "/");

export const useSocketStore = create<SocketState>((set, get) => ({
    socket: null,

    connectSocket: () => {
        const accessToken = useAuthStore.getState().accessToken;
        const existingSocket = get().socket;

        if (existingSocket) {
            return;
        }

        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token: accessToken },
            withCredentials: true,
        });

        set({ socket });

        socket.on("connect", () => {
            console.log("Connected to WebSocket server. ID: " + socket.id);
        });
    },

    disconnectSocket: () => {
        const socket = get().socket;
        if (socket) {
            socket.disconnect();
            set({ socket: null });
        }
    }
}));

