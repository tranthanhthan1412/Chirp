import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthstore";
import { useChatStore } from "@/stores/useChatstore";
import { cn } from "@/lib/utils";
import UnreadCountBadge from "./UnreadCountBadge";
import GroupChatAvatar from "./GroupChatAvatar";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
    const { user } = useAuthStore();
    const { activeConversationId, setActiveConversationId, messages } = useChatStore();

    if (!user) return null;

    const groupName = convo.group?.name || "Nhóm trò chuyện";
    const unreadCount = convo.unreadCounts?.[user._id] ?? convo.unreadCounts?.["test-user"] ?? 0;

    const getLastMessagePreview = () => {
        if (!convo.lastMessage) return "Chưa có tin nhắn nào";
        const isMe = convo.lastMessage.sender?._id === user._id;
        const senderName = isMe ? "Bạn" : convo.lastMessage.sender?.displayName || "Thành viên";
        return `${senderName}: ${convo.lastMessage.content}`;
    };

    const handleSelectConversation = async (id: string) => {
        setActiveConversationId(id);
        if (!messages[id]) {
            // todo: fetch messages
        }
    };

    return (
        <ChatCard
            convoId={convo._id}
            name={groupName}
            timestamp={convo.lastMessage?.createdAt ? new Date(convo.lastMessage.createdAt) : (convo.updatedAt ? new Date(convo.updatedAt) : undefined)}
            isActive={activeConversationId === convo._id}
            onSelect={handleSelectConversation}
            unreadCount={unreadCount}
            leftSection={
                <div className="relative">
                    {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
                    <GroupChatAvatar participants={convo.participants} type="sidebar" />
                </div>
            }
            subTitle={
                <p className={cn("text-xs truncate", unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {getLastMessagePreview()}
                </p>
            }
        />
    );
};

export default GroupChatCard;
