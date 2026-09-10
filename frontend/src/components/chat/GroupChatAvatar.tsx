import type { Participant } from "@/types/chat";
import { cn } from "@/lib/utils";
import UserAvatar from "./UserAvatar";
import { Ellipsis } from "lucide-react";

interface GroupChatAvatarProps {
    participants: Participant[];
    type: "sidebar" | "chat";
    className?: string;
}

const GroupChatAvatar = ({ participants = [], type, className }: GroupChatAvatarProps) => {
    const maxCount = type === "chat" ? 4 : 3;
    const limit = Math.min(participants.length, maxCount);
    const visibleMembers = participants.slice(0, limit);

    const avatarSizeClass = type === "sidebar" ? "size-8 text-xs" : "size-7 text-[10px]";
    const overlapClass = type === "sidebar" ? "-space-x-2.5" : "-space-x-2";

    return (
        <div className={cn("relative flex items-center *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background", overlapClass, className)}>
            {visibleMembers.map((member, index) => (
                <UserAvatar
                    key={member._id || index}
                    type={type}
                    name={member.displayName ?? ""}
                    avatarUrl={member.avatarUrl ?? undefined}
                    className={avatarSizeClass}
                />
            ))}

            {/* Hiển thị nếu số lượng thành viên vượt quá giới hạn */}
            {participants.length > maxCount && (
                <div
                    className={cn(
                        "relative z-10 flex items-center justify-center rounded-full bg-muted text-muted-foreground ring-2 ring-background shrink-0 font-medium",
                        type === "sidebar" ? "size-8 text-xs" : "size-7 text-[10px]"
                    )}
                >
                    <Ellipsis className={type === "sidebar" ? "size-3.5" : "size-3"} />
                </div>
            )}
        </div>
    );
};

export default GroupChatAvatar;
