import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useFriendStore } from "@/stores/useFriendStore";
import { openConversation } from "@/lib/openConversation";
import { errorMessage } from "@/lib/errorMessage";
import { toast } from "sonner";
import FriendPicker from "./FriendPicker";
import { useSidebar } from "@/components/ui/sidebar";

interface CreateNewChatProps {
  children?: React.ReactNode;
}

const CreateNewChat = ({ children }: CreateNewChatProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const { setOpenMobile } = useSidebar();
  async function select(id: string) {
    if (busy) return;
    setBusy(true);
    try { await openConversation("direct", [id]); setOpen(false); setOpenMobile(false); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onOpenChange={value => { setOpen(value); if (value) { setQuery(""); void useFriendStore.getState().refresh(); } }}>
    <DialogTrigger render={<Button
      variant="outline"
      className="w-full justify-start gap-2 shadow-xs"
    />}>
      <MessageSquarePlus className="size-4" />
      <span>Cuộc trò chuyện mới</span>
      {children}
    </DialogTrigger>
    <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Cuộc trò chuyện mới</DialogTitle><DialogDescription>Chọn một người bạn để nhắn tin.</DialogDescription></DialogHeader><FriendPicker query={query} setQuery={setQuery} selected={[]} toggle={select} disabled={busy} />{busy && <p role="status">Đang mở cuộc trò chuyện...</p>}</DialogContent>
    </Dialog>
  );
};

export default CreateNewChat;
