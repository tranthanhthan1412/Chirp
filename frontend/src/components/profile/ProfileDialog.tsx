import { useEffect, useState } from "react";
import { Camera, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/useAuthstore";
import { useThemeStore } from "@/stores/useThemestore";
import { userService } from "@/services/userService";
import { errorMessage } from "@/lib/errorMessage";

export default function ProfileDialog({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  return open ? <ProfileContent open={open} setOpen={setOpen} /> : null;
}

function ProfileContent({ open, setOpen }: { open: boolean; setOpen: (value: boolean) => void }) {
  const user = useAuthStore(s => s.user);
  const { isDark, toggleTheme } = useThemeStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  if (!user) return null;
  function selectFile(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    e.target.value = "";
    if (!selected) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(selected.type) || selected.size > 2 * 1024 * 1024) {
      toast.error("Chọn ảnh JPG, PNG hoặc WebP, tối đa 2 MB"); return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }
  async function upload() {
    if (!file) return;
    setBusy(true);
    try { const updated = await userService.uploadAvatar(file); useAuthStore.setState(s => ({ user: s.user ? { ...s.user, avatarUrl: updated.avatarUrl } : null })); setFile(null); setPreview(undefined); toast.success("Đã cập nhật ảnh đại diện"); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  async function save(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try { const updated = await userService.update({ displayName: displayName.trim(), bio, phone }); useAuthStore.setState({ user: updated }); toast.success("Đã lưu hồ sơ"); }
    catch (error) { toast.error(errorMessage(error)); }
    finally { setBusy(false); }
  }
  return <Dialog open={open} onOpenChange={value => { if (!busy) setOpen(value); }}><DialogContent className="sm:max-w-xl max-h-[90dvh] overflow-y-auto p-6">
    <DialogHeader><DialogTitle className="text-xl">Hồ sơ & cài đặt</DialogTitle><DialogDescription>Thông tin cá nhân và giao diện Chirp của bạn.</DialogDescription></DialogHeader>
    <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-4">
      <Avatar className="size-20"><AvatarImage src={preview ?? user.avatarUrl} alt={user.displayName} /><AvatarFallback className="text-2xl">{user.displayName.charAt(0)}</AvatarFallback></Avatar>
      <div className="min-w-0 space-y-2"><p className="truncate text-lg font-semibold">{user.displayName}</p><p className="text-xs text-muted-foreground">@{user.username || user.userName}</p>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-primary"><Camera className="size-4" />Chọn ảnh đại diện<input type="file" accept="image/jpeg,image/png,image/webp" aria-label="Chọn ảnh đại diện" className="sr-only" disabled={busy} onChange={selectFile} /></label>
      </div>
    </div>
    <p className="text-xs text-muted-foreground">Ảnh JPG, PNG hoặc WebP, tối đa 2 MB.</p>
    {file && <div className="flex gap-2"><Button disabled={busy} onClick={upload}>{busy ? "Đang tải ảnh..." : "Lưu ảnh đại diện"}</Button><Button variant="outline" disabled={busy} onClick={() => { setFile(null); setPreview(undefined); }}>Hủy ảnh</Button></div>}
    <Tabs defaultValue="personal"><TabsList><TabsTrigger value="personal">Tài khoản</TabsTrigger><TabsTrigger value="preferences">Giao diện</TabsTrigger><TabsTrigger value="privacy">Bảo mật</TabsTrigger></TabsList>
      <TabsContent value="personal"><form onSubmit={save} className="space-y-4">
        <label className="block space-y-2">Tên hiển thị<Input value={displayName} onChange={e => setDisplayName(e.target.value)} required maxLength={80} disabled={busy} /></label>
        <label className="block space-y-2">Email<Input value={user.email} readOnly /></label>
        <label className="block space-y-2">Số điện thoại<Input type="tel" value={phone} maxLength={30} onChange={e => setPhone(e.target.value)} disabled={busy} /></label>
        <label className="block space-y-2">Giới thiệu<textarea className="min-h-24 w-full rounded-lg border bg-background p-3" value={bio} maxLength={1000} onChange={e => setBio(e.target.value)} disabled={busy} /></label>
        <Button type="submit" disabled={busy || !displayName.trim()}>{busy && <LoaderCircle className="size-4 animate-spin" />}Lưu thay đổi</Button>
      </form></TabsContent>
      <TabsContent value="preferences"><label className="flex items-center justify-between rounded-lg border p-4">Chế độ tối<Switch checked={isDark} onCheckedChange={toggleTheme} /></label><p className="mt-3 text-xs text-muted-foreground">Lựa chọn được lưu trên trình duyệt này.</p></TabsContent>
      <TabsContent value="privacy"><div className="space-y-3 rounded-lg border p-4 text-sm"><p>Tài khoản: <strong>@{user.username || user.userName}</strong></p><p className="text-muted-foreground">Đăng xuất khi sử dụng thiết bị dùng chung để kết thúc phiên đăng nhập hiện tại.</p><Button variant="outline" disabled={busy} onClick={() => void useAuthStore.getState().signOut()}>Đăng xuất</Button></div></TabsContent>
    </Tabs>
  </DialogContent></Dialog>;
}
