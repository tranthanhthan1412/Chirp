import { Card } from "@/components/ui/card";
import { formatOnlineTime, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";

interface ChatCardProps {
    convoId: string;
    name: string;
    timestamp?: Date;
    isActive: boolean;
    onSelect?: (id: string) => void;
    onSlect?: (id: string) => void; // alias
    unreadCount?: number;
    leftSection?: React.ReactNode;
    subTitle: React.ReactNode;
}

const ChatCard = ({
    convoId,
    name,
    timestamp,
    isActive,
    onSelect,
    onSlect,
    unreadCount = 0,
    leftSection,
    subTitle,
}: ChatCardProps) => {
    const handleSelect = () => {
        if (onSelect) onSelect(convoId);
        else if (onSlect) onSlect(convoId);
    };

    return (
        <Card
            key={convoId}
            className={cn(
                "group relative border-none p-2.5 cursor-pointer transition-all duration-150 rounded-xl shadow-none",
                isActive
                    ? "bg-primary/10 text-sidebar-accent-foreground font-medium ring-2 ring-primary shadow-sm hover:bg-primary/15"
                    : "hover:bg-muted/50"
            )}
            onClick={handleSelect}
        >
            <div className="flex items-center gap-3">
                <div className="relative shrink-0">{leftSection}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 gap-1">
                        <h3
                            className={cn(
                                "text-sm truncate",
                                unreadCount > 0 ? "font-semibold text-foreground" : "font-medium text-foreground/90"
                            )}
                        >
                            {name}
                        </h3>
                        <span className="text-[11px] text-muted-foreground shrink-0">
                            {timestamp ? formatOnlineTime(timestamp) : ""}
                        </span>
                    </div>
                    <div className="flex items-center justify-between gap-1">
                        <div className="flex-1 min-w-0">{subTitle}</div>
                        {unreadCount > 0 ? (
                            <Badge className="h-4 min-w-4 px-1 text-[10px] font-bold rounded-full shrink-0">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                        ) : (
                            <MoreHorizontal className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default ChatCard;