import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";
import mongoose from "mongoose";

const pair = (a, b) => {
    const strA = a.toString();
    const strB = b.toString();
    return strA < strB ? [strA, strB] : [strB, strA];
};

export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id;
        // type/memberIds chỉ thuộc API tạo cuộc trò chuyện, không dùng để bỏ qua kiểm tra khi gửi tin.
        const type = req.baseUrl === "/api/conversations" ? req.body.type : "direct";
        const { conversationId } = req.body;
        let recipientId = req.body?.recipientId ?? null;
        let memberIds = req.baseUrl === "/api/conversations" ? req.body?.memberIds ?? [] : [];

        if (!Array.isArray(memberIds) || memberIds.some(id => typeof id !== "string" || !mongoose.isValidObjectId(id)) ||
            (recipientId && !mongoose.isValidObjectId(recipientId)) || (conversationId && !mongoose.isValidObjectId(conversationId))) {
            return res.status(400).json({ message: "Danh sách thành viên hoặc ID không hợp lệ" });
        }
        if (req.baseUrl === "/api/conversations" && type === "direct" && memberIds.length !== 1) return res.status(400).json({ message: "Chat riêng cần đúng một người bạn" });
        if (memberIds.length > 100) return res.status(400).json({ message: "Tối đa 100 người được mời" });
        if (conversationId) {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation || !conversation.participants.some(p => String(p.userId) === String(me))) {
                return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
            }
            if (conversation.type !== "direct") return res.status(400).json({ message: "Hãy dùng API tin nhắn nhóm" });
            const other = conversation.participants.find(p => String(p.userId) !== String(me));
            if (recipientId && String(other?.userId) !== recipientId) return res.status(400).json({ message: "Người nhận không khớp cuộc trò chuyện" });
            recipientId = String(other.userId);
        }

        // 1. Trường hợp tạo nhóm (Group)
        if (type === "group" || (Array.isArray(memberIds) && memberIds.length > 1)) {
            // Lọc bỏ chính mình và các id trùng lặp
            const uniqueMemberIds = [...new Set(memberIds.map((id) => id.toString()))].filter(
                (id) => id !== me.toString()
            );

            if (uniqueMemberIds.length === 0) {
                return res.status(400).json({ message: "Nhóm cần ít nhất 1 thành viên khác bạn" });
            }

            // Kiểm tra bạn bè giữa `me` và từng thành viên trong nhóm
            const friendChecks = uniqueMemberIds.map(async (memberId) => {
                const [userA, userB] = pair(me, memberId);
                const isFriend = await Friend.findOne({ userA, userB });
                return isFriend ? null : memberId;
            });

            const results = await Promise.all(friendChecks);
            const nonFriends = results.filter(Boolean);

            if (nonFriends.length > 0) {
                return res.status(403).json({
                    message: `Không thể tạo nhóm. Có ${nonFriends.length} người chưa phải là bạn bè của bạn`,
                    nonFriendIds: nonFriends
                });
            }

            return next();
        }

        // 2. Trường hợp Direct: lấy recipientId từ memberIds nếu có
        if (!recipientId && Array.isArray(memberIds) && memberIds.length > 0) {
            recipientId = memberIds[0];
        }

        // 3. Trường hợp gửi kèm conversationId khi chat tiếp trong phòng có sẵn
        if (!recipientId && conversationId) {
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({ message: "Cuộc trò chuyện không tồn tại" });
            }

            if (conversation.type === "direct") {
                const other = conversation.participants.find(
                    (p) => p.userId.toString() !== me.toString()
                );
                if (other) {
                    recipientId = other.userId.toString();
                }
            } else {
                // Là nhóm chat (group): Kiểm tra người gửi có nằm trong nhóm không
                const isMember = conversation.participants.some(
                    (p) => p.userId.toString() === me.toString()
                );
                if (!isMember) {
                    return res.status(403).json({ message: "Bạn không phải thành viên của nhóm này" });
                }
                return next();
            }
        }

        // 4. Kiểm tra bạn bè 1-1 (Direct)
        if (!recipientId) {
            return res.status(400).json({ message: "Thiếu recipientId, memberIds hoặc conversationId" });
        }

        if (me.toString() === recipientId.toString()) {
            return res.status(400).json({ message: "Không thể tạo cuộc trò chuyện hoặc nhắn tin cho chính mình" });
        }

        const [userA, userB] = pair(me, recipientId);
        const isFriend = await Friend.findOne({ userA, userB });

        if (!isFriend) {
            return res.status(403).json({ message: "Hai người chưa phải là bạn bè" });
        }

        return next();
    } catch (error) {
        console.error("Lỗi khi kiểm tra bạn bè:", error);
        return res.status(500).json({ message: "Lỗi khi kiểm tra bạn bè" });
    }
};

export const checkGroupMembership = async (req, res, next) => {
    try {
        const { conversationId } = req.body;
        const userId = req.user._id;

        if (!conversationId || !mongoose.isValidObjectId(conversationId)) {
            return res.status(400).json({ message: "Thiếu conversationId" });
        }

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Không tìm thấy cuộc trò chuyện" });
        }

        if (conversation.type !== "group") {
            return res.status(400).json({ message: "Cuộc trò chuyện này không phải là nhóm" });
        }

        const isMember = conversation.participants.some(
            (p) => p.userId.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(403).json({ message: "Bạn không phải thành viên của nhóm này" });
        }

        req.conversation = conversation;
        return next();
    } catch (error) {
        console.error("Lỗi khi kiểm tra thành viên nhóm:", error);
        return res.status(500).json({ message: "Lỗi khi kiểm tra thành viên nhóm" });
    }
};
