import { useChatStore } from "@/stores/useChatstore";
import GroupChatCard from "./GroupChatCard";

const GroupChatList = () => {
    const { conversations } = useChatStore();

    if (!conversations) return null;

    const groupChats = conversations.filter((convo) => convo.type === "group");

    const mockGroupChats: any[] = [
        {
            _id: "mock-group-1",
            type: "group",
            group: { name: "Team Frontend", createdBy: "user-1" },
            participants: [
                { _id: "user-1", displayName: "An", avatarUrl: null, joinedAt: "" },
                { _id: "user-2", displayName: "Bình", avatarUrl: null, joinedAt: "" }
            ],
            unreadCounts: { "test-user": 0 },
            lastMessage: {
                _id: "gmsg-1",
                content: "Deploy code lên staging chưa?",
                createdAt: new Date().toISOString(),
                sender: { _id: "user-1", displayName: "An" }
            },
            updatedAt: new Date().toISOString()
        },
        {
            _id: "mock-group-2",
            type: "group",
            group: { name: "Hội Bạn Thân ☕", createdBy: "user-1" },
            participants: [
                { _id: "user-1", displayName: "Hải", avatarUrl: null, joinedAt: "" },
                { _id: "user-2", displayName: "Linh", avatarUrl: null, joinedAt: "" },
                { _id: "user-3", displayName: "Minh", avatarUrl: null, joinedAt: "" },
                { _id: "user-4", displayName: "Quân", avatarUrl: null, joinedAt: "" },
                { _id: "user-5", displayName: "Trang", avatarUrl: null, joinedAt: "" }
            ],
            unreadCounts: { "test-user": 4 },
            lastMessage: {
                _id: "gmsg-2",
                content: "Tối nay 8h hẹn ở quán cũ nhé mọi người ơi!",
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                sender: { _id: "user-3", displayName: "Minh" }
            },
            updatedAt: new Date().toISOString()
        }
    ];

    const displayList = groupChats.length > 0 ? groupChats : mockGroupChats;

    return (
        <div className="flex-1 overflow-y-auto space-y-1">
            {displayList.map((convo) => (
                <GroupChatCard key={convo._id} convo={convo} />
            ))}
        </div>
    );
};

export default GroupChatList;