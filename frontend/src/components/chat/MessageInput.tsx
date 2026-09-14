import { useState } from "react";
import type { Conversation } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthstore";
import { useChatStore } from "@/stores/useChatstore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ImagePlus, Send } from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import { toast } from "sonner";

interface MessageInputProps {
    selectedConvo: Conversation;
}

// Khung nhập và gửi tin nhắn (văn bản, emoji, hình ảnh)
const MessageInput = ({ selectedConvo }: MessageInputProps) => {
    const { user } = useAuthStore();
    const { sendDirectMessage, sendGroupMessage } = useChatStore();
    const [value, setValue] = useState("");

    if (!user) return null;

    // Xử lý gửi tin nhắn
    const sendMessage = async () => {
        if (!value.trim()) return;
        const content = value.trim();
        setValue("");

        try {
            // Gửi tin nhắn qua API (và cập nhật store)
            if (selectedConvo.type === "direct") {
                const otherUser = selectedConvo.participants.find((p) => p._id !== user._id);
                if (otherUser) {
                    await sendDirectMessage(otherUser._id, content);
                }
            } else {
                await sendGroupMessage(selectedConvo._id, content);
            }
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            toast.error("Lỗi xảy ra khi gửi tin nhắn. Bạn hãy thử lại!");
        }
    };

    // Gửi tin nhắn khi nhấn phím Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background border-t border-border/40">
            {/* Nút chọn ảnh đính kèm */}
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 transition-smooth shrink-0 cursor-pointer"
                title="Đính kèm ảnh"
            >
                <ImagePlus className="size-4 text-muted-foreground" />
            </Button>

            {/* Ô nhập nội dung tin nhắn & Nút chọn Emoji */}
            <div className="flex-1 relative">
                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Soạn tin nhắn..."
                    className="pr-10 h-9 bg-background border-border/50 focus-visible:border-primary/50 transition-smooth"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    <EmojiPicker onChange={(emoji: string) => setValue((prev) => `${prev}${emoji}`)} />
                </div>
            </div>

            {/* Nút gửi tin nhắn */}
            <Button
                type="button"
                onClick={sendMessage}
                disabled={!value.trim()}
                className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105 shrink-0 cursor-pointer disabled:opacity-50"
                title="Gửi tin nhắn"
            >
                <Send className="size-4 text-white" />
            </Button>
        </div>
    );
};

export default MessageInput;