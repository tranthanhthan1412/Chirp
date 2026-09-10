import { useChatStore } from "@/stores/useChatstore";
import DirectMessageCard from "./DirectMessageCard";

const DirectMessageList = () => {
    const { conversations } = useChatStore();

    if (!conversations) return null;

    const directConversations = conversations.filter((convo) => convo.type === "direct");

    const mockConversations: any[] = [
        {
            _id: "mock-1",
            type: "direct",
            participants: [
                { _id: "other-user-1", displayName: "Nguyễn Văn A", avatarUrl: null, joinedAt: "" }
            ],
            unreadCounts: { "test-user": 3 },
            lastMessage: {
                _id: "msg-1",
                content: "Chào bạn, hôm nay có rảnh không?",
                createdAt: new Date().toISOString(),
                sender: { _id: "other-user-1", displayName: "Nguyễn Văn A" }
            },
            updatedAt: new Date().toISOString()
        },
        {
            _id: "mock-2",
            type: "direct",
            participants: [
                { _id: "other-user-2", displayName: "Trần Thị B", avatarUrl: null, joinedAt: "" }
            ],
            unreadCounts: { "test-user": 15 },
            lastMessage: {
                _id: "msg-2",
                content: "Mình gửi tài liệu rồi nhé!",
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                sender: { _id: "other-user-2", displayName: "Trần Thị B" }
            },
            updatedAt: new Date().toISOString()
        }
    ];

    const displayList = directConversations.length > 0 ? directConversations : mockConversations;

    return (
        <div className="flex-1 overflow-y-auto space-y-1">
            {displayList.map((convo) => (
                <DirectMessageCard key={convo._id} convo={convo} />
            ))}
        </div>
    );
};

export default DirectMessageList;