import { useEffect } from "react";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ChatWindowLayout from "@/components/chat/ChatWindowLayout";
import { useChatStore } from "@/stores/useChatstore";

const ChatAppPage = () => {
    const { fetchConversations } = useChatStore();

    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="h-[calc(100dvh-1rem)] overflow-hidden">
                <ChatWindowLayout />
            </SidebarInset>
        </SidebarProvider>
    );
};

export default ChatAppPage;

