import { useChatStore } from "@/stores/useChatstore";
import DirectMessageCard from "./DirectMessageCard";

const DirectMessageList = () => {
    const { conversations } = useChatStore();

    if (!conversations) return null;

    const directConversations = conversations.filter((convo) => convo.type === "direct");

    if (directConversations.length === 0) {
        return (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                Chưa có cuộc trò chuyện nào
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto space-y-1">
            {directConversations.map((convo) => (
                <DirectMessageCard key={convo._id} convo={convo} />
            ))}
        </div>
    );
};

export default DirectMessageList;