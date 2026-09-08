import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthstore";
import { useChatStore } from "@/stores/useChatstore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
    const { user } = useAuthStore();
    const { activeConversationId, setActiveConversationId, messages } = useChatStore();

    if (!user) return null;

    const otherUser = convo.participants.find((p) => p._id !== user._id);
    if (!otherUser) return null;

    const unreadCount = convo.unreadCounts?.[user._id] || 0;
    const lastMessage = convo.lastMessage?.content ?? "";

    const handleSelectConversation = async (id: string) => {
        setActiveConversationId(id);
        if (!messages[id]) {
            // todo: fetch messages
        }
    };

    return (
        <ChatCard
            convoId={convo._id}
            name={otherUser.displayName || "Người dùng"}
            timestamp={convo.lastMessage?.createdAt ? new Date(convo.lastMessage.createdAt) : (convo.updatedAt ? new Date(convo.updatedAt) : undefined)}
            isActive={activeConversationId === convo._id}
            onSelect={handleSelectConversation}
            unreadCount={unreadCount}
            leftSection={
                <Avatar size="default">
                    <AvatarImage src={otherUser.avatarUrl || undefined} alt={otherUser.displayName} />
                    <AvatarFallback>
                        {otherUser.displayName ? otherUser.displayName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                </Avatar>
            }
            subTitle={
                <p className={cn("text-xs truncate", unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {lastMessage || "Chưa có tin nhắn nào"}
                </p>
            }
        />
    );
};

export default DirectMessageCard;