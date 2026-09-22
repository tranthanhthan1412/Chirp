import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationSkeleton() {
  return <div role="status" aria-label="Đang tải danh sách" className="space-y-4 p-3">
    {[0, 1, 2].map(i => <div key={i} className="flex gap-3"><Skeleton className="size-10 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-full" /></div></div>)}
  </div>;
}
