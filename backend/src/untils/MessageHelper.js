import Conversation from "../models/Conversation.js";

export const updateConversation = async (conversation, message, senderId) => {
    const increments = {};
    for (const p of conversation.participants) {
        const id = p.userId.toString();
        if (id !== senderId.toString()) increments["unreadCount." + id] = 1;
    }
    // Atomic increments prevent concurrent reads from restoring stale counts.
    const updated = await Conversation.findByIdAndUpdate(conversation._id, {
        $set: {
            seenBy: [], lastMessageAt: message.createdAt,
            lastMessage: { _id: message._id.toString(), content: message.content || "", senderId, createdAt: message.createdAt },
            ["unreadCount." + senderId]: 0,
        },
        $inc: increments,
    }, { returnDocument: 'after' });
    conversation.set(updated.toObject());
    return conversation;
};

export const emitNewMessage = (io, conversation, message, sender) => {
    const unreadCountObj = conversation.unreadCount instanceof Map
        ? Object.fromEntries(conversation.unreadCount)
        : (conversation.unreadCount || {});

    const payload = {
        message,
        conversation: {
            _id: conversation._id.toString(),
            lastMessage: conversation.lastMessage ? {
                _id: conversation.lastMessage._id || message._id.toString(),
                content: conversation.lastMessage.content ?? message.content,
                createdAt: conversation.lastMessage.createdAt || message.createdAt,
                sender: {
                    _id: message.senderId.toString(),
                    displayName: sender?.displayName || "",
                    avatarUrl: sender?.avatarUrl ?? null,
                }
            } : null,
            seenBy: [],
            lastMessageAt: conversation.lastMessageAt || message.createdAt
        },
        unreadCount: unreadCountObj,
        unreadCounts: unreadCountObj,
    };

    // Broadcast to the union so each socket receives the event once.
    const rooms = [conversation._id.toString(), ...conversation.participants.map(p =>
        p.userId?._id?.toString() || p.userId.toString()
    )];
    io.to(rooms).emit("new-message", payload);
};

export const updateConversationAfterCreateMessage = updateConversation;
