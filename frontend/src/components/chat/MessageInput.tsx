import { useEffect, useRef, useState } from "react";
import type { Conversation } from "@/types/chat";
import { useAuthStore } from "@/stores/useAuthstore";
import { useChatStore } from "@/stores/useChatstore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Send } from "lucide-react";
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
    const [sending, setSending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const sendingRef = useRef(false);

    useEffect(() => {
        if (!user) return;

        const focusComposer = (event: KeyboardEvent) => {
            if (event.key !== "Enter" || event.defaultPrevented || event.repeat ||
                event.isComposing || event.keyCode === 229 ||
                event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;

            const target = event.target;
            if (!(target instanceof HTMLElement) || target.closest(
                'input, textarea, select, button, a[href], [contenteditable]:not([contenteditable="false"]), [role="button"], [role="textbox"], [role="combobox"], [tabindex]:not([tabindex="-1"])'
            )) return;
            if (document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"], [role="listbox"], [data-slot="popover-content"]')) return;

            event.preventDefault();
            inputRef.current?.focus();
        };

        document.addEventListener("keydown", focusComposer);
        return () => document.removeEventListener("keydown", focusComposer);
    }, [user]);

    if (!user) return null;

    // Xử lý gửi tin nhắn
    const sendMessage = async () => {
        if (!value.trim() || sendingRef.current) return;
        const content = value.trim();
        const otherUser = selectedConvo.participants.find((p) => p._id !== user._id);
        if (selectedConvo.type === "direct" && !otherUser) return;
        sendingRef.current = true;
        setSending(true);
        inputRef.current?.focus();

        try {
            // Gửi tin nhắn qua API (và cập nhật store)
            if (selectedConvo.type === "direct") {
                if (otherUser) {
                    await sendDirectMessage(otherUser._id, content);
                }
            } else {
                await sendGroupMessage(selectedConvo._id, content);
            }
            setValue("");
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
            toast.error("Lỗi xảy ra khi gửi tin nhắn. Bạn hãy thử lại!");
        } finally {
            sendingRef.current = false;
            setSending(false);
        }
    };

    // Gửi tin nhắn khi nhấn phím Enter
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey &&
            !e.nativeEvent.isComposing && e.nativeEvent.keyCode !== 229) {
            e.preventDefault();
            if (!e.repeat) void sendMessage();
        }
    };

    return (
        <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background border-t border-border/40">

            {/* Ô nhập nội dung tin nhắn & Nút chọn Emoji */}
            <div className="flex-1 relative">
                <Input
                    ref={inputRef}
                    value={value}
                    readOnly={sending}
                    aria-busy={sending}
                    aria-label="Soạn tin nhắn"
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Soạn tin nhắn..."
                    className="pr-10 h-9 bg-background border-border/50 focus-visible:border-primary/50 transition-smooth"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
                    <EmojiPicker disabled={sending} onChange={(emoji: string) => setValue((prev) => `${prev}${emoji}`)} />
                </div>
            </div>

            {/* Nút gửi tin nhắn */}
            <Button
                type="button"
                onClick={sendMessage}
                disabled={sending || !value.trim()}
                className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105 shrink-0 cursor-pointer disabled:opacity-50"
                title="Gửi tin nhắn"
            >
                <Send className="size-4 text-white" />
            </Button>
        </div>
    );
};

export default MessageInput;
