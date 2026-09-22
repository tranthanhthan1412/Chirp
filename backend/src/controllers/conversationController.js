import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { io } from "../socket/index.js";
import mongoose from "mongoose";
import { messagePage, messagePageQuery } from "../untils/pagination.js";
import { serializeConversation } from "../untils/serializeConversation.js";



export const createConversation = async (req, res) => {
    try {
        const { type, name, memberIds } = req.body;
        const userId = req.user._id;

        if (!type || !["direct", "group"].includes(type)) {
            return res.status(400).json({ message: "Loại cuộc trò chuyện không hợp lệ (direct hoặc group)" });
        }

        if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
            return res.status(400).json({ message: "Danh sách thành viên (memberIds) là bắt buộc" });
        }

        if (type === "group" && (typeof name !== "string" || !name.trim() || name.trim().length > 80)) {
            return res.status(400).json({ message: "Tên nhóm là bắt buộc" });
        }

        let conversation;

        if (type === "direct") {
            const participantId = memberIds[0];

            conversation = await Conversation.findOne({
                type: "direct",
                "participants.userId": { $all: [userId, participantId] },
            });

            if (!conversation) {
                conversation = await Conversation.create({
                    type: "direct",
                    participants: [{ userId: userId }, { userId: participantId }],
                    lastMessageAt: new Date(),
                    unreadCount: new Map()
                });
            }
        }

        if (type === "group") {
            const uniqueMemberIds = [...new Set(memberIds.map(id => id.toString()))].filter(
                id => id !== userId.toString()
            );

            conversation = await Conversation.create({
                type: "group",
                participants: [
                    { userId: userId },
                    ...uniqueMemberIds.map(id => ({ userId: id }))
                ],
                group: {
                    name: name.trim(),
                    createdBy: userId
                },
                lastMessageAt: new Date(),
                unreadCount: new Map()
            });
        }

        await conversation.populate([
            { path: "participants.userId", select: "displayName userName avatarUrl" },
            { path: "seenBy", select: "displayName userName avatarUrl" },
            { path: "group.createdBy", select: "displayName userName avatarUrl" }
        ]);

        const formatted = serializeConversation(conversation);
        // Phòng cá nhân luôn tồn tại, kể cả khi người nhận chưa mở nhóm mới.
        io.to(formatted.participants.map(p => p._id)).emit("conversation-created", formatted);
        return res.status(201).json({ conversation: formatted });

    } catch (error) {
        console.error("Lỗi khi tạo conversation: ", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

export const getCoversations = async (req, res) => {
    try {
        const userId = req.user._id;

        const conversations = await Conversation.find({
            "participants.userId": userId
        })
            .sort({ lastMessageAt: -1, updatedAt: -1 })
            .populate({
                path: "participants.userId",
                select: "displayName avatarUrl",
            })
            .populate({
                path: "lastMessage.senderId",
                select: "displayName avatarUrl",
            })
            .populate({
                path: "seenBy",
                select: "displayName avatarUrl",
            });

        const formatted = conversations.map(convo => {
            const convoObj = convo.toObject();
            const participants = (convo.participants || []).map((p) => ({
                _id: p.userId?._id?.toString() || p.userId?.toString(),
                displayName: p.userId?.displayName || "",
                avatarUrl: p.userId?.avatarUrl ?? null,
                joinedAt: p.joinedAt,
            }));

            let lastMessage = null;
            if (convo.lastMessage && convo.lastMessage._id) {
                const senderObj = convo.lastMessage.senderId;
                lastMessage = {
                    _id: convo.lastMessage._id,
                    content: convo.lastMessage.content || "",
                    createdAt: convo.lastMessage.createdAt,
                    sender: senderObj && typeof senderObj === 'object' ? {
                        _id: senderObj._id?.toString() || senderObj.toString(),
                        displayName: senderObj.displayName || "",
                        avatarUrl: senderObj.avatarUrl || null,
                    } : {
                        _id: senderObj?.toString() || "",
                        displayName: "",
                        avatarUrl: null,
                    }
                };
            }

            const unreadCountObj = convo.unreadCount instanceof Map
                ? Object.fromEntries(convo.unreadCount)
                : (convoObj.unreadCount || {});

            return {
                ...convoObj,
                lastMessage,
                unreadCount: unreadCountObj,
                unreadCounts: unreadCountObj,
                participants,
            };
        });
        return res.status(200).json({ conversations: formatted });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

export const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        let page;
        try { page = messagePageQuery(conversationId, req.query.cursor, req.query.limit); }
        catch (error) { return res.status(400).json({ message: error.message }); }
        const member = await Conversation.exists({ _id: conversationId, "participants.userId": req.user._id });
        if (!member) return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
        const rows = await Message.find(page.query).sort({ createdAt: -1, _id: -1 }).limit(page.limit + 1);
        return res.status(200).json(messagePage(rows, page.limit));
    } catch (error) {
        console.error("Lỗi khi lấy tin nhắn:", error);
        return res.status(500).json({ message: "Lỗi server" });
    }
};

export const getUserConversationsForSocketIO = async (userId) => {
    try {
        const conversations = await Conversation.find(
            { "participants.userId": userId },
            { _id: 1 }
        );
        return conversations.map(c => c._id.toString());
    } catch (error) {
        console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
        return [];
    }
}




export const markConversationRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        if (!mongoose.isValidObjectId(conversationId)) return res.status(400).json({ message: "Invalid conversation ID" });
        const userId = req.user._id.toString();
        const conversation = await Conversation.findOneAndUpdate(
            { _id: conversationId, "participants.userId": req.user._id },
            { $set: { ["unreadCount." + userId]: 0 }, $addToSet: { seenBy: req.user._id } },
            { returnDocument: 'after' }
        );
        if (!conversation) return res.status(404).json({ message: "Conversation not found" });
        const receipt = { conversationId, userId, lastMessageId: conversation.lastMessage?._id ?? null };
        io.to(conversation.participants.map(p => p.userId.toString())).emit("conversation-read", receipt);
        return res.status(200).json(receipt);
    } catch (error) {
        console.error("Failed to mark conversation read:", error);
        return res.status(500).json({ message: "Failed to mark conversation read" });
    }
};
