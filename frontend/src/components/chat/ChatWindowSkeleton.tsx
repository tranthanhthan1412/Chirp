import { Skeleton } from "@/components/ui/skeleton";

const ChatWindowSkeleton = () => {
  return (
    <div role="status" aria-label="Đang tải tin nhắn" className="flex h-full flex-col justify-end gap-5 p-6">
      {[0, 1, 2, 3, 4].map(i => <div key={i} className={`flex gap-3 ${i % 2 ? "justify-end" : ""}`}><Skeleton className="size-8 rounded-full" /><Skeleton className={`h-12 rounded-2xl ${i % 2 ? "w-1/3" : "w-1/2"}`} /></div>)}
    </div>
  );
};

export default ChatWindowSkeleton;
