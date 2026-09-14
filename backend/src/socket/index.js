import { Server } from "socket.io";
import http from "http";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
});

io.on("connection", async (socket) => {
    console.log(`socket connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`socket disconnected: ${socket.id}`);
    });
});

export { io, app, server };