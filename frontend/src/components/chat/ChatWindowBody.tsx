import { useEffect, useLayoutEffect, useRef } from "react";
import { useChatStore } from "@/stores/useChatstore";
import { Button } from "@/components/ui/button";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import MessageItem from "./MessageItem";

const EMPTY_MESSAGES: import("@/types/chat").Message[] = [];

export default function ChatWindowBody() {
  const { activeConversationId, conversations, messages: allMessages, fetchMessages, loadingMessages, messageErrors, markConversationRead } = useChatStore();
  const id = activeConversationId ?? "";
  const page = allMessages[id];
  const messages = page?.items ?? EMPTY_MESSAGES;
  const loading = loadingMessages[id] ?? false;
  const error = messageErrors[id];
  const selectedConvo = conversations.find(c => c._id === id);
  const reversed = [...messages].reverse();
  const container = useRef<HTMLDivElement>(null);
  const previous = useRef({ height: 0, top: 0, first: "", last: "", count: 0 });
  const lastMessageId = messages.at(-1)?._id;
  const lastMessageStatus = selectedConvo?.seenBy?.some(u => u._id !== selectedConvo.lastMessage?.sender._id) ? "seen" : "delivered";

  useEffect(() => {
    if (id && page?.nextCursor === undefined && !loading && !error) void fetchMessages(id);
  }, [id, page?.nextCursor, loading, error, fetchMessages]);

  useEffect(() => {
    const read = () => {
      if (id && lastMessageId && document.visibilityState === "visible" && document.hasFocus()) void markConversationRead(id);
    };
    read();
    document.addEventListener("visibilitychange", read);
    window.addEventListener("focus", read);
    return () => { document.removeEventListener("visibilitychange", read); window.removeEventListener("focus", read); };
  }, [id, lastMessageId, markConversationRead]);

  // Khi chèn trang cũ ở đầu, bù đúng phần chiều cao tăng thêm để giữ tin đang đọc.
  // Tin mới chỉ kéo xuống nếu người dùng ở gần cuối hoặc vừa gửi tin.
  useLayoutEffect(() => {
    const element = container.current;
    if (!element || !messages.length) return;
    const prev = previous.current;
    const first = messages[0]._id;
    const last = messages.at(-1)!;
    const nearBottom = prev.height - prev.top - element.clientHeight < 100;
    if (!prev.count || (prev.last !== last._id && (nearBottom || last.isOwn))) {
      element.scrollTop = element.scrollHeight;
    } else if (prev.first !== first) {
      element.scrollTop = prev.top + element.scrollHeight - prev.height;
    }
    previous.current = { height: element.scrollHeight, top: element.scrollTop, first, last: last._id, count: messages.length };
  }, [messages]);

  // Nếu trang đầu chưa lấp đầy khung, nạp tiếp để có thể cuộn lên.
  useEffect(() => {
    const element = container.current;
    if (element && page?.hasMore && !loading && !error && element.scrollHeight <= element.clientHeight + 1) void fetchMessages(id);
  }, [id, page, loading, error, fetchMessages]);

  if (!selectedConvo) return <ChatWelcomeScreen />;
  if (!messages.length && loading) return <ChatWindowSkeleton />;

  return <div ref={container} className="h-full overflow-y-auto overflow-x-hidden p-4 bg-primary-foreground beatiful-scrollbar" style={{ overflowAnchor: "none" }}
    onScroll={() => {
      const element = container.current;
      if (!element) return;
      previous.current.top = element.scrollTop;
      if (element.scrollTop < 80 && page?.hasMore && !loading && !error) void fetchMessages(id);
    }}>
    {error && <p role="alert" className="mb-3 text-center text-sm text-destructive">{error} <Button variant="link" onClick={() => void fetchMessages(id)}>Thử lại</Button></p>}
    {page?.hasMore && <div className="text-center"><Button size="sm" variant="ghost" disabled={loading} onClick={() => void fetchMessages(id)}>{loading ? "Đang tải..." : "Tải tin nhắn cũ hơn"}</Button></div>}
    {!messages.length && !loading && !error && <p className="flex h-full items-center justify-center text-sm text-muted-foreground">Chưa có tin nhắn. Hãy gửi lời chào đầu tiên!</p>}
    <div className="space-y-1">
      {messages.map((message, index) => <MessageItem key={message._id} message={message} index={messages.length - index - 1} messages={reversed} selectedConvo={selectedConvo} lastMessageStatus={lastMessageStatus} />)}
    </div>
  </div>;
}
