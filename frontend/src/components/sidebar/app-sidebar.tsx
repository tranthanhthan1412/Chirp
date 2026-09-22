import * as React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/sidebar/nav-user";
import { useAuthStore } from "@/stores/useAuthstore";
import CreateNewChat from "@/components/chat/CreateNewChat";
import NewGroupChatModal from '@/components/chat/NewGroupChatModal';
import GroupChatList from '../chat/GroupChatList';
import AddFriendModal from '../chat/AddFriendModal';
import DirectMessageList from '../chat/DirectMessageList';
import { useThemeStore } from '@/stores/useThemestore';
import { useChatStore } from '@/stores/useChatstore';
import ConversationSkeleton from '../chat/ConversationSkeleton';
import { useFriendStore } from '@/stores/useFriendStore';
import FriendRequestDialog from '../chat/FriendRequestDialog';
import { Button } from '../ui/button';
import { Bell } from 'lucide-react';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const convoLoading = useChatStore(s => s.convoLoading);
  const requestCount = useFriendStore(s => s.received.length);
  const [requestsOpen, setRequestsOpen] = React.useState(false);


  return (
    <Sidebar variant="inset" {...props}>
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-12 w-full items-center justify-between rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3 text-white shadow-sm">
              <h1 className="text-xl font-bold tracking-tight">Chirp</h1>
              <div className="flex items-center gap-2">
                {isDark ? <Moon className="size-4 text-white/90" /> : <Sun className="size-4 text-white/90" />}
                <Switch
                  checked={isDark}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="beatiful-scrollbar">
        {/* New chat */}
        <SidebarGroup>
          <SidebarGroupContent>
            <CreateNewChat>

            </CreateNewChat>
            <Button variant="ghost" className="mt-2 w-full justify-start" onClick={() => setRequestsOpen(true)}><Bell className="size-4" />Lời mời kết bạn {requestCount > 0 && <span className="ml-auto rounded-full bg-primary px-2 text-primary-foreground">{requestCount}</span>}</Button>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Group Chat */}
        <SidebarGroup>
          <div className="flex items-center justify-between"><SidebarGroupLabel className='uppercase '>
            Nhóm chat
          </SidebarGroupLabel>
            <NewGroupChatModal />
          </div>

          <SidebarGroupContent>
            {convoLoading ? <ConversationSkeleton /> : <GroupChatList />}
          </SidebarGroupContent>


        </SidebarGroup>

        {/* Direct Chat */}
        <SidebarGroup>
          <div className="flex items-center justify-between"><SidebarGroupLabel className='uppercase '>
            Bạn bè
          </SidebarGroupLabel>
            <AddFriendModal />
          </div>

          <SidebarGroupContent>
            {convoLoading ? <ConversationSkeleton /> : <DirectMessageList />}
          </SidebarGroupContent>


        </SidebarGroup>


      </SidebarContent>

      {/* Footer */}
      <SidebarFooter>
        {user && <NavUser user={user} />}
      </SidebarFooter>
      <FriendRequestDialog open={requestsOpen} setOpen={setRequestsOpen} />
    </Sidebar>
  );
}
