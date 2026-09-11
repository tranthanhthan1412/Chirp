import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import ChatWindowLayout from "@/components/chat/ChatWindowLayout";

const ChatAppPage = () => {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="h-[calc(100vh-1rem)] overflow-hidden">
                <ChatWindowLayout />
            </SidebarInset>
        </SidebarProvider>
    );
};

export default ChatAppPage;

