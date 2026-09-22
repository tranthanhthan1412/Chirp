import { useRef, useState } from "react";
import { Search, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { friendService } from "@/services/friendService";
import { useFriendStore } from "@/stores/useFriendStore";
import type { Friend } from "@/types/user";
import { errorMessage } from "@/lib/errorMessage";
import UserAvatar from "./UserAvatar";

export default function AddFriendModal() {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<Friend | null>(null);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const searchVersion = useRef(0);
  const { friends, sent: requests, received } = useFriendStore();
  const relationship = result && (friends.some(f => f._id === result._id) ? "Đã là bạn bè" : sent || requests.some(r => r.to?._id === result._id) ? "Đã gửi lời mời" : received.some(r => r.from?._id === result._id) ? "Người này đã gửi lời mời cho bạn" : "");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    const version = ++searchVersion.current;
    setBusy(true); setResult(null); setSearched(false); setSent(false);
    try {
      const user = await friendService.search(username.trim());
      if (version === searchVersion.current) { setResult(user); setSearched(true); }
    } catch (error) { toast.error(errorMessage(error)); }
    finally { if (version === searchVersion.current) setBusy(false); }
  }
  async function send() {
    if (!result || busy) return;
    setBusy(true);
    try { await friendService.send(result._id, message.trim()); setSent(true); toast.success("Đã gửi lời mời kết bạn"); void useFriendStore.getState().refresh(); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) { searchVersion.current++; setBusy(false); setUsername(""); setResult(null); setSearched(false); setMessage(""); setSent(false); void useFriendStore.getState().refresh(); } }}>
    <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Kết bạn" />}><UserPlus className="size-4" /></DialogTrigger>
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Thêm bạn bè</DialogTitle><DialogDescription>Tìm bạn bằng tên đăng nhập chính xác.</DialogDescription></DialogHeader>
      <form onSubmit={search} className="flex gap-2">
        <Input aria-label="Tên đăng nhập cần tìm" placeholder="Nhập tên đăng nhập" value={username} maxLength={100} disabled={busy} onChange={e => { setUsername(e.target.value); setResult(null); setSearched(false); }} />
        <Button type="submit" disabled={busy || !username.trim()}><Search className="size-4" />Tìm</Button>
      </form>
      {busy && <p role="status" className="text-sm text-muted-foreground">Đang xử lý...</p>}
      {searched && !result && <p role="status">Không tìm thấy người dùng khác có tên đăng nhập này.</p>}
      {result && <div className="space-y-4 rounded-xl border p-4">
        <div className="flex items-center gap-3"><UserAvatar type="sidebar" name={result.displayName} avatarUrl={result.avatarUrl} /><div><p className="font-medium">{result.displayName}</p><p className="text-xs text-muted-foreground">@{result.userName}</p></div></div>
        {relationship ? <p role="status" className="text-sm text-primary">{relationship}</p> : <><label className="block space-y-2 text-sm">Lời nhắn<textarea className="min-h-20 w-full rounded-md border bg-background p-2" maxLength={300} value={message} onChange={e => setMessage(e.target.value)} placeholder="Chào bạn, mình kết bạn nhé!" /></label><Button className="w-full" disabled={busy} onClick={send}>Gửi lời mời kết bạn</Button></>}
      </div>}
    </DialogContent>
  </Dialog>;
}
