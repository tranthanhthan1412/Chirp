import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthstore";
import { useChatStore } from "@/stores/useChatstore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

const GroupChatCard = ({ convo }: { convo: Conversation }) => {
    const { user } = useAuthStore();
    const { activeConversationId, setActiveConversationId, messages } = useChatStore();

    if (!user) return null;

    const groupName = convo.group?.name || "Nhóm trò chuyện";
    const unreadCount = convo.unreadCounts?.[user._id] || 0;

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
                <Avatar size="default">
                    <AvatarFallback className="bg-primary/10 text-primary">
                        <Users className="size-4" />
                    </AvatarFallback>
                </Avatar>
            }
            subTitle={
                <p className="text-sm truncate text-muted-foreground">
                    {convo.participants.length} thành viên
                </p>
            }
        />
    );
};

export default GroupChatCard;