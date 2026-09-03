import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { updateConversationAfterCreateMessage } from "../untils/MessageHelper.js";


export const sendDirectMessage = async (req, res) => {
    try {
        const { recipientId, content, conversationId } = req.body;
        const senderId = req.user._id;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Thiếu nội dung tin nhắn" });
        }

        let conversation;

        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
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
            content,
        });

        await updateConversationAfterCreateMessage(conversation, message, senderId);

        return res.status(201).json({ message });
    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        return res.status(500).json({ message: "Lỗi khi gửi tin nhắn" });
    }
};
export const sendGroupMessage = async (req, res) => { };
