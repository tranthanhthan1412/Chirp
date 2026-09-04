import Conversation from "../models/Conversation.js";
import Friend from "../models/Friend.js";

const pair = (a, b) => {
    const strA = a.toString();
    const strB = b.toString();
    return strA < strB ? [strA, strB] : [strB, strA];
};

export const checkFriendship = async (req, res, next) => {
    try {
        const me = req.user._id;
        const { type, conversationId } = req.body;
        let recipientId = req.body?.recipientId ?? null;
        let memberIds = req.body?.memberIds ?? [];

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

