import { useChatStore } from "@/stores/useChatstore";
import DirectMessageCard from "./DirectMessageCard";

const DirectMessageList = () => {
    const { conversations } = useChatStore();

    if (!conversations) return null;

    const directConversations = conversations.filter((convo) => convo.type === "direct");

    if (directConversations.length === 0) {
        return (
            <div className="p-3 text-center text-xs text-muted-foreground">
                Chưa có cuộc trò chuyện nào
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto space-y-1 p-1">
            {directConversations.map((convo) => (
                <DirectMessageCard key={convo._id} convo={convo} />
            ))}
        </div>
    );
};

export default DirectMessageList;