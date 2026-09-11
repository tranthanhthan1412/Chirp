import { useChatStore } from "@/stores/useChatstore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";

const ChatWindowLayout = () => {
  const { activeConversationId, conversations, messageLoading: loading, messages } = useChatStore();

  const selectedConvo = conversations.find((c) => c._id === activeConversationId) ?? null;

  if (!activeConversationId) {
    return <ChatWelcomeScreen />;
  }

  if (loading) {
    return <ChatWindowSkeleton />
  }

  return (
    <div className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
      {/* TODO: Add ChatHeader */}
      <ChatWindowHeader />

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground">
        <ChatWindowBody />
      </div>

      {/* TODO: Add Input Area */}
      <MessageInput />
    </div>
  );


};

export default ChatWindowLayout;