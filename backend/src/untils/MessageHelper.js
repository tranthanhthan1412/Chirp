export const updateConversation = async (conversation, message, senderId) => {
    conversation.set({
        seenBy: [],
        lastMessageAt: message.createdAt,
        lastMessage: {
            _id: message._id,
            content: message.content,
            senderId,
            createdAt: message.createdAt
        },
    });

    conversation.participants.forEach((p) => {
        const memberId = p.userId.toString();
        const isSender = memberId === senderId.toString();
        const prevCount = conversation.unreadCount.get(memberId) || 0;
        conversation.unreadCount.set(memberId, !isSender ? prevCount + 1 : 0);
    });

    return await conversation.save();
};

export const updateConversationAfterCreateMessage = updateConversation;