import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useFriendStore } from "@/stores/useFriendStore";
import { friendService } from "@/services/friendService";
import { errorMessage } from "@/lib/errorMessage";
import ConversationSkeleton from "./ConversationSkeleton";
import UserAvatar from "./UserAvatar";

export default function FriendRequestDialog({ open, setOpen }: { open: boolean; setOpen: (open: boolean) => void }) {
  const { sent, received, loading, error, refresh } = useFriendStore();
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => { if (open) void refresh(); }, [open, refresh]);
  async function respond(id: string, action: "accept" | "decline") {
    setBusy(id);
    try { await friendService.respond(id, action); await refresh(); toast.success(action === "accept" ? "Đã kết bạn! Bạn có thể bắt đầu trò chuyện." : "Đã từ chối lời mời"); }
    catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(null); }
  }
  return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-lg max-h-[85dvh] overflow-y-auto">
    <DialogHeader><DialogTitle>Lời mời kết bạn</DialogTitle><DialogDescription>Quản lý lời mời đã nhận và đã gửi.</DialogDescription></DialogHeader>
    {error && <p role="alert">{error} <Button variant="link" onClick={refresh}>Thử lại</Button></p>}
    <Tabs defaultValue="received"><TabsList><TabsTrigger value="received">Đã nhận ({received.length})</TabsTrigger><TabsTrigger value="sent">Đã gửi ({sent.length})</TabsTrigger></TabsList>
      {(["received", "sent"] as const).map(tab => <TabsContent key={tab} value={tab}>
        {loading ? <ConversationSkeleton /> : (tab === "received" ? received : sent).length === 0 ? <p className="py-8 text-center text-muted-foreground">Chưa có lời mời nào.</p> : <div className="space-y-3">{(tab === "received" ? received : sent).map(request => {
          const person = tab === "received" ? request.from : request.to;
          return <div key={request._id} className="rounded-lg border p-3 space-y-3"><div className="flex items-center gap-3"><UserAvatar type="sidebar" name={person?.displayName ?? "Người dùng không còn tồn tại"} avatarUrl={person?.avatarUrl} /><div className="min-w-0"><p className="truncate font-medium">{person?.displayName ?? "Người dùng không còn tồn tại"}</p><p className="text-xs text-muted-foreground">{new Date(request.createdAt).toLocaleDateString("vi-VN")}</p></div></div>{request.message && <p className="break-words text-sm text-muted-foreground">{request.message}</p>}{tab === "received" ? <div className="flex gap-2"><Button disabled={!!busy || !person} onClick={() => respond(request._id, "accept")}>Chấp nhận</Button><Button variant="outline" disabled={!!busy} onClick={() => respond(request._id, "decline")}>Từ chối</Button></div> : <p className="text-xs text-muted-foreground">Đang chờ phản hồi</p>}</div>;
        })}</div>}
      </TabsContent>)}
    </Tabs>
  </DialogContent></Dialog>;
}
