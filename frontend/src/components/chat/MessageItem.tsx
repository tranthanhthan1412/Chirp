import { cn, formatMessageTime, isSameDay } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat";
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  selectedConvo: Conversation;
  lastMessageStatus: "delivered" | "seen";
}

// Component hiển thị từng tin nhắn tương tự Messenger (gom nhóm avatar, hiển thị mốc thời gian cách quãng)
const MessageItem = ({
  message,
  index,
  messages,
  selectedConvo,
  lastMessageStatus,
}: MessageItemProps) => {
  // Tin nhắn trước đó theo thứ tự thời gian (cũ hơn)
  const prev = index + 1 < messages.length ? messages[index + 1] : undefined;
  // Tin nhắn kế tiếp theo thứ tự thời gian (mới hơn)
  const next = index - 1 >= 0 ? messages[index - 1] : undefined;

  // Hiển thị mốc thời gian nếu là tin nhắn đầu tiên hoặc cách tin nhắn trước hơn 10 phút / khác ngày
  const isShowTime =
    !prev ||
    !isSameDay(new Date(message.createdAt), new Date(prev.createdAt)) ||
    new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() > 10 * 60 * 1000;

  // Kiểm tra tin nhắn đầu tiên / cuối cùng trong chuỗi tin nhắn của cùng một người
  const isFirstInBlock = isShowTime || !prev || prev.senderId !== message.senderId;
  const isLastInBlock =
    !next ||
    next.senderId !== message.senderId ||
    !isSameDay(new Date(next.createdAt), new Date(message.createdAt)) ||
    new Date(next.createdAt).getTime() - new Date(message.createdAt).getTime() > 10 * 60 * 1000;

  const participant = selectedConvo.participants.find(
    (p: Participant) => p._id.toString() === message.senderId.toString()
  );

  return (
    <div className="flex flex-col w-full">
      {/* Mốc thời gian ở giữa tương tự Messenger */}
      {isShowTime && (
        <div className="flex justify-center my-3 select-none">
          <span className="text-xs text-muted-foreground/80 font-normal px-2 py-0.5">
            {formatMessageTime(new Date(message.createdAt))}
          </span>
        </div>
      )}

      {/* Dòng tin nhắn */}
      <div
        className={cn(
          "flex gap-2 items-end",
          isFirstInBlock && !isShowTime ? "mt-2" : "mt-0.5",
          message.isOwn ? "justify-end" : "justify-start"
        )}
      >
        {/* Avatar người gửi (hiển thị ở tin nhắn cuối cùng của nhóm tin nhắn) */}
        {!message.isOwn && (
          <div className="w-8 shrink-0 flex items-end justify-center">
            {isLastInBlock && (
              <UserAvatar
                type="chat"
                name={participant?.displayName ?? "Chirp"}
                avatarUrl={participant?.avatarUrl ?? undefined}
              />
            )}
          </div>
        )}

        {/* Bong bóng tin nhắn */}
        <div
          className={cn(
            "max-w-xs lg:max-w-md flex flex-col",
            message.isOwn ? "items-end" : "items-start"
          )}
        >
          {/* Tên người gửi trong nhóm chat */}
          {!message.isOwn && selectedConvo.type === "group" && isFirstInBlock && (
            <span className="text-[11px] text-muted-foreground px-1 mb-0.5">
              {participant?.displayName ?? "Thành viên"}
            </span>
          )}

          <Card
            title={formatMessageTime(new Date(message.createdAt))}
            className={cn(
              "px-3 py-2 text-sm leading-relaxed break-words shadow-none transition-smooth",
              message.isOwn
                ? "chat-bubble-sent border-0 text-white rounded-2xl"
                : "chat-bubble-received border-0 rounded-2xl"
            )}
          >
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          </Card>

          {/* Trạng thái đã gửi / đã xem cho tin nhắn mới nhất */}
          {message.isOwn && message._id === selectedConvo.lastMessage?._id && (
            <div className="mt-0.5">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-4 border-0 select-none",
                  lastMessageStatus === "seen"
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {lastMessageStatus === "seen" ? "Đã xem" : "Đã gửi"}
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;