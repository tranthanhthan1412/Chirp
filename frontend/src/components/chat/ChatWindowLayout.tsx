import { useChatStore } from "@/stores/useChatstore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";

const ChatWindowLayout = () => {
  const { activeConversationId, conversations } = useChatStore();

  const selectedConvo = conversations.find((c) => c._id === activeConversationId) ?? null;

  if (!activeConversationId) {
    return <ChatWelcomeScreen />;
  }

  return (
    <div className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
      {/* Header */}
      <ChatWindowHeader chat={selectedConvo ?? undefined} />

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto bg-primary-foreground">
        <ChatWindowBody />
      </div>

      {/* Input Area */}
      <MessageInput />
    </div>
  );
};

export default ChatWindowLayout;