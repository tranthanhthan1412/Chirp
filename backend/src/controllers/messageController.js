import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { emitNewMessage, updateConversationAfterCreateMessage } from "../untils/MessageHelper.js";
import { io } from "../socket/index.js";

export const sendDirectMessage = async (req, res) => {
    try {
        const { recipientId, content, conversationId, imgUrl } = req.body;
        const senderId = req.user._id;

        if ((content !== undefined && typeof content !== "string") || (imgUrl !== undefined && typeof imgUrl !== "string") || (content?.length ?? 0) > 10000) {
            return res.status(400).json({ message: "Nội dung tin nhắn không hợp lệ (tối đa 10000 ký tự)" });
        }
        if ((!content || !content.trim()) && !imgUrl) {
            return res.status(400).json({ message: "Thiếu nội dung tin nhắn hoặc hình ảnh" });
        }

        let conversation;

        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
            if (!conversation || conversation.type !== "direct" || !conversation.participants.some(p => String(p.userId) === String(senderId))) {
                return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
            }
            if (recipientId && !conversation.participants.some(p => String(p.userId) === recipientId)) {
                return res.status(400).json({ message: "Người nhận không khớp cuộc trò chuyện" });
            }
        } else if (recipientId) {
            // Tìm conversation direct đã tồn tại giữa 2 người
            conversation = await Conversation.findOne({
                type: "direct",
                "participants.userId": { $all: [senderId, recipientId] }
            });
        }

        // Nếu chưa có conversation thì tạo mới
        if (!conversation) {
            if (!recipientId) {
                return res.status(400).json({ message: "Thiếu recipientId hoặc conversationId" });
            }

            conversation = await Conversation.create({
                type: "direct",
                participants: [
                    {
                        userId: senderId,
                        joinedAt: new Date(),
                    },
                    {
                        userId: recipientId,
                        joinedAt: new Date(),
                    }
                ],
                lastMessageAt: Date.now(),
                unreadCount: new Map()
            });
        }

        const message = await Message.create({
            conversationId: conversation._id,
            senderId: senderId,
            content: content?.trim() || "",
            imgUrl: imgUrl || undefined,
        });

        await updateConversationAfterCreateMessage(conversation, message, senderId);

        // emit new message
        emitNewMessage(io, conversation, message, req.user);

        return res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        return res.status(500).json({ message: "Lỗi khi gửi tin nhắn" });
    }
};

export const sendGroupMessage = async (req, res) => {
    try {
        const { conversationId, content, imgUrl } = req.body;
        const senderId = req.user._id;
        const conversation = req.conversation;

        if ((content !== undefined && typeof content !== "string") || (imgUrl !== undefined && typeof imgUrl !== "string") || (content?.length ?? 0) > 10000) {
            return res.status(400).json({ message: "Nội dung tin nhắn không hợp lệ (tối đa 10000 ký tự)" });
        }
        if ((!content || !content.trim()) && !imgUrl) {
            return res.status(400).json({ message: "Thiếu nội dung tin nhắn hoặc hình ảnh" });
        }

        const message = await Message.create({
            conversationId,
            senderId,
            content: content?.trim() || "",
            imgUrl: imgUrl || undefined,
        });

        await updateConversationAfterCreateMessage(conversation, message, senderId);

        // emit new message
        emitNewMessage(io, conversation, message, req.user);

        return res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn nhóm:", error);
        return res.status(500).json({ message: "Lỗi khi gửi tin nhắn nhóm" });
    }
};
