import type { Conversation } from "@/types/chat";
import ChatCard from "./ChatCard";
import { useAuthStore } from "@/stores/useAuthstore";
import { useChatStore } from "@/stores/useChatstore";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import { cn } from "@/lib/utils";
import UnreadCountBadge from "./UnreadCountBadge";

const DirectMessageCard = ({ convo }: { convo: Conversation }) => {
    const { user } = useAuthStore();
    const { activeConversationId, setActiveConversationId, messages, fetchMessages } = useChatStore();

    if (!user) return null;

    const otherUser = convo.participants.find((p) => p._id !== user._id);
    if (!otherUser) return null;

    const unreadCount = convo.unreadCounts?.[user._id] ?? convo.unreadCounts?.["test-user"] ?? 0;
    const lastMessage = convo.lastMessage?.content ?? "";

    const handleSelectConversation = async (id: string) => {
        setActiveConversationId(id);
        if (!messages[id]) {
            await fetchMessages(id);
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
                <div className="relative">
                    <UserAvatar
                        type="sidebar"
                        name={otherUser.displayName ?? ""}
                        avatarUrl={otherUser.avatarUrl ?? undefined}
                    />
                    {/* //TODO: socket io*/}
                    <StatusBadge status="offline" />
                    {
                        unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />
                    }
                </div>
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
