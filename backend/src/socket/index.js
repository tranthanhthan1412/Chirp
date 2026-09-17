import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";
import { socketAuthMiddleware } from "../middlewares/socketMiddleware.js";
import { getUserConversationsForSocketIO } from "../controllers/conversationController.js";

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
});

io.use(socketAuthMiddleware);

const userSockets = new Map(); // { userId: Set<socketId> }

io.on("connection", async (socket) => {
    const user = socket.user;
    const userId = user._id.toString();

    console.log(` ${user.displayName} online với socket ${socket.id}`);

    if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join personal user room so messages can be sent directly to user
    socket.join(userId);

    io.emit("online-users", Array.from(userSockets.keys()));

    const conversationIds = await getUserConversationsForSocketIO(user._id);
    conversationIds.forEach((id) => {
        socket.join(id);
    });

    socket.on("disconnect", () => {
        if (userSockets.has(userId)) {
            const sockets = userSockets.get(userId);
            sockets.delete(socket.id);
            if (sockets.size === 0) {
                userSockets.delete(userId);
            }
        }
        io.emit("online-users", Array.from(userSockets.keys()));
        console.log(`User ${user.displayName} disconnected: ${socket.id}`);
    });
});

export { io, app, server };