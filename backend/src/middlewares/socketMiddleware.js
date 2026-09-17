import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuthMiddleware = async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error("Unauthorized - Token không tồn tại"));

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return next(new Error("Unauthorized - Token không hợp lệ"));
        }

        const userId = decoded.userId || decoded.id;
        const user = await User.findById(userId).select("-hashedPassword");
        if (!user) {
            return next(new Error("Unauthorized - User không tồn tại"));
        }

        socket.userId = user._id.toString();
        socket.user = user;
        next();
    } catch (error) {
        console.error("Socket auth error:", error);
        return next(new Error("Unauthorized"));
    }
};