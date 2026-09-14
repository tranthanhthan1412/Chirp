import { useChatStore } from "@/stores/useChatstore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import MessageInput from "./MessageInput";

// Layout tổng thể của cửa sổ chat (Header, Danh sách tin nhắn, Khung nhập liệu)
const ChatWindowLayout = () => {
  const { activeConversationId, conversations } = useChatStore();

  const selectedConvo = conversations.find((c) => c._id === activeConversationId) ?? null;

  // Hiển thị màn hình chào mừng nếu chưa chọn cuộc trò chuyện nào
  if (!activeConversationId || !selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  return (
    <div className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
      {/* Header cuộc trò chuyện */}
      <ChatWindowHeader chat={selectedConvo} />

      {/* Vùng hiển thị tin nhắn */}
      <div className="flex-1 flex flex-col min-h-0 bg-primary-foreground overflow-hidden">
        <ChatWindowBody />
      </div>

      {/* Khung nhập tin nhắn */}
      <MessageInput selectedConvo={selectedConvo} />
    </div>
  );
};

export default ChatWindowLayout;