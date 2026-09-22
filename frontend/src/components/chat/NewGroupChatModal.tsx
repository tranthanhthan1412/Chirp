import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFriendStore } from "@/stores/useFriendStore";
import { openConversation } from "@/lib/openConversation";
import { errorMessage } from "@/lib/errorMessage";
import { toast } from "sonner";
import FriendPicker from "./FriendPicker";
import { useSidebar } from "@/components/ui/sidebar";

const NewGroupChatModal = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const { setOpenMobile } = useSidebar();
  const friends = useFriendStore(s => s.friends);
  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !name.trim() || !selected.length) return;
    setBusy(true);
    try { await openConversation("group", selected, name.trim()); setOpen(false); setOpenMobile(false); toast.success("Đã tạo nhóm trò chuyện"); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) { setName(""); setQuery(""); setSelected([]); void useFriendStore.getState().refresh(); } }}>
    <DialogTrigger render={<Button variant="ghost" size="icon" aria-label="Tạo nhóm mới" />}>
      <Plus className="size-4" />
      <span className="sr-only">Tạo nhóm mới</span>
    </DialogTrigger>
    <DialogContent className="sm:max-w-lg max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Tạo nhóm trò chuyện</DialogTitle><DialogDescription>Đặt tên và chọn những người bạn muốn mời.</DialogDescription></DialogHeader>
      <form onSubmit={create} className="space-y-4">
        <label className="block space-y-2">Tên nhóm<Input value={name} onChange={e => setName(e.target.value)} maxLength={80} required placeholder="Ví dụ: Nhóm học lập trình" disabled={busy} /></label>
        <div className="flex flex-wrap gap-1">{selected.map(id => <Button key={id} variant="secondary" size="sm" type="button" disabled={busy} onClick={() => setSelected(s => s.filter(i => i !== id))}>{friends.find(f => f._id === id)?.displayName} ×</Button>)}</div>
        <FriendPicker query={query} setQuery={setQuery} selected={selected} disabled={busy} toggle={id => setSelected(s => s.includes(id) ? s.filter(i => i !== id) : [...s, id])} />
        <Button className="w-full" type="submit" disabled={busy || !name.trim() || !selected.length}>{busy ? "Đang tạo..." : `Tạo nhóm (${selected.length + 1} thành viên)`}</Button>
      </form>
    </DialogContent></Dialog>
  );
};

export default NewGroupChatModal;
