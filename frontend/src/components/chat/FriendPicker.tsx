import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFriendStore } from "@/stores/useFriendStore";
import ConversationSkeleton from "./ConversationSkeleton";
import UserAvatar from "./UserAvatar";

export default function FriendPicker({ query, setQuery, selected, toggle, disabled }: {
  query: string; setQuery: (s: string) => void; selected: string[]; toggle: (id: string) => void; disabled: boolean;
}) {
  const { friends, loading, error, refresh } = useFriendStore();
  const filtered = friends.filter(f => `${f.displayName} ${f.userName}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <div className="space-y-3">
    <Input aria-label="Lọc danh sách bạn bè" placeholder="Tìm trong danh sách bạn bè..." value={query} onChange={e => setQuery(e.target.value)} />
    {error ? <p role="alert">{error} <Button variant="link" onClick={refresh}>Thử lại</Button></p> : loading ? <ConversationSkeleton /> : <div className="max-h-64 overflow-y-auto space-y-1">
      {filtered.length === 0 && <p className="py-6 text-center text-muted-foreground">{friends.length ? "Không có bạn bè phù hợp." : "Hãy kết bạn trước để bắt đầu trò chuyện."}</p>}
      {filtered.map(friend => <button key={friend._id} type="button" disabled={disabled} aria-pressed={selected.includes(friend._id)} className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-muted aria-pressed:bg-primary/10 disabled:opacity-50" onClick={() => toggle(friend._id)}>
        <UserAvatar type="sidebar" name={friend.displayName} avatarUrl={friend.avatarUrl} /><span className="min-w-0 flex-1"><span className="block truncate font-medium">{friend.displayName}</span><span className="text-xs text-muted-foreground">@{friend.userName}</span></span>{selected.includes(friend._id) && <span className="text-primary">✓</span>}
      </button>)}
    </div>}
  </div>;
}
