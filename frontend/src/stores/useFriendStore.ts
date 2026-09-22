import { create } from "zustand";
import { friendService } from "@/services/friendService";
import type { Friend, FriendRequest } from "@/types/user";
import { errorMessage } from "@/lib/errorMessage";

interface FriendState {
  friends: Friend[];
  sent: FriendRequest[];
  received: FriendRequest[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  reset: () => void;
}

let generation = 0;
export const useFriendStore = create<FriendState>((set) => ({
  friends: [], sent: [], received: [], loading: false, error: null,
  reset: () => { generation++; set({ friends: [], sent: [], received: [], loading: false, error: null }); },
  refresh: async () => {
    const current = ++generation;
    set({ loading: true, error: null });
    try {
      const [list, requests] = await Promise.all([friendService.list(), friendService.requests()]);
      if (current === generation) set({ ...list, ...requests, loading: false });
    } catch (error) {
      if (current === generation) set({ loading: false, error: errorMessage(error) });
    }
  },
}));
