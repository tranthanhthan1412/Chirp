export function serializeConversation(conversation) {
    const c = conversation.toObject ? conversation.toObject() : conversation;
    const counts = c.unreadCount instanceof Map ? Object.fromEntries(c.unreadCount) : c.unreadCount || {};
    const sender = c.lastMessage?.senderId;
    return {
        ...c,
        group: c.group ? { ...c.group, createdBy: String(c.group.createdBy?._id ?? c.group.createdBy) } : undefined,
        participants: c.participants.map(p => ({
            _id: String(p.userId._id ?? p.userId),
            displayName: p.userId.displayName ?? "",
            avatarUrl: p.userId.avatarUrl ?? null,
            joinedAt: p.joinedAt,
        })),
        unreadCounts: counts,
        lastMessage: c.lastMessage ? {
            ...c.lastMessage,
            sender: { _id: String(sender?._id ?? sender), displayName: sender?.displayName ?? "", avatarUrl: sender?.avatarUrl ?? null },
        } : null,
    };
}
