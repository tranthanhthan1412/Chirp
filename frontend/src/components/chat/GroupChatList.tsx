import { useChatStore } from "@/stores/useChatstore";
import GroupChatCard from "./GroupChatCard";

const GroupChatList = () => {
    const { conversations } = useChatStore();

    if (!conversations) return null;

    const groupChats = conversations.filter((convo) => convo.type === "group");

    if (groupChats.length === 0) {
        return (
            <div className="p-3 text-center text-xs text-muted-foreground">
                Chưa tham gia nhóm nào
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto space-y-1 p-1">
            {groupChats.map((convo) => (
                <GroupChatCard key={convo._id} convo={convo} />
            ))}
        </div>
    );
};

export default GroupChatList;