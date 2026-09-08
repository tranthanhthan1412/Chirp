import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { MessageSquare } from "lucide-react";

export function ChatWindowLayout() {
  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-background">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Messages</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/60 mb-4 shadow-sm">
          <MessageSquare className="size-7 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Welcome to Chirp</h2>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Select a conversation from the sidebar or start a new chat to begin messaging with your friends.
        </p>
      </div>
    </div>
  );
}

export default ChatWindowLayout;
