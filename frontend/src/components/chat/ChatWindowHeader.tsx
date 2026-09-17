import { useChatStore } from "@/stores/useChatstore";
import type { Conversation } from "@/types/chat";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuthStore } from "@/stores/useAuthstore";
import { Separator } from "../ui/separator";
import UserAvatar from "./UserAvatar";
import StatusBadge from "./StatusBadge";
import GroupChatAvatar from "./GroupChatAvatar";
import { useSocketStore } from "@/stores/useSocketStore";

const ChatWindowHeader = ({ chat }: { chat?: Conversation }) => {
    const { conversations, activeConversationId } = useChatStore();
    const { user } = useAuthStore();
    const { onlineUsers } = useSocketStore();

    const currentChat = chat ?? conversations.find((c) => c._id === activeConversationId);

    if (!currentChat) {
        return (
            <header className="sticky top-0 z-10 flex items-center gap-2 px-4 py-2.5 w-full border-b bg-background">
                <SidebarTrigger className="-ml-1 text-foreground cursor-pointer" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                <span className="text-sm font-medium text-muted-foreground">Chirp Chat</span>
            </header>
        );
    }

    let otherUser = null;
    let title = "";
    let subTitle = "";
    let isOnline = false;

    if (currentChat.type === "direct") {
        const otherUsers = currentChat.participants?.filter((p) => p._id !== user?._id) ?? [];
        otherUser = otherUsers.length > 0 ? otherUsers[0] : (currentChat.participants?.[0] ?? null);
        title = otherUser?.displayName || "Người dùng";
        isOnline = otherUser?._id ? onlineUsers.includes(otherUser._id) : false;
        subTitle = isOnline ? "Đang hoạt động" : "Ngoại tuyến";
    } else {
        title = currentChat.group?.name || "Nhóm trò chuyện";
        const memberCount = currentChat.participants?.length || 0;
        subTitle = `${memberCount} thành viên`;
    }

    return (
        <header className="sticky top-0 z-10 px-4 py-2.5 flex items-center bg-background border-b">
            <div className="flex items-center gap-2 w-full">
                <SidebarTrigger className="-ml-1 text-foreground cursor-pointer" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />

                <div className="flex items-center gap-3 w-full min-w-0">
                    {/* avatar */}
                    <div className="relative shrink-0">
                        {currentChat.type === "direct" ? (
                            <>
                                <UserAvatar
                                    type="sidebar"
                                    name={title}
                                    avatarUrl={otherUser?.avatarUrl || undefined}
                                />
                                <StatusBadge status={isOnline ? "online" : "offline"} />
                            </>
                        ) : (
                            <GroupChatAvatar
                                participants={currentChat.participants}
                                type="sidebar"
                            />
                        )}
                    </div>

                    {/* name & info */}
                    <div className="flex flex-col min-w-0">
                        <h2 className="font-semibold text-sm text-foreground truncate">
                            {title}
                        </h2>
                        <span className="text-xs text-muted-foreground truncate">
                            {subTitle}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default ChatWindowHeader;