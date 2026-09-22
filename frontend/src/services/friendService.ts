import api from "@/lib/axios";
import type { Friend, FriendRequest } from "@/types/user";

export const friendService = {
  async list(): Promise<{ friends: Friend[] }> { return (await api.get("/friends")).data; },
  async requests(): Promise<{ sent: FriendRequest[]; received: FriendRequest[] }> { return (await api.get("/friends/requests")).data; },
  async search(username: string): Promise<Friend | null> { return (await api.get("/users/search", { params: { username } })).data.user; },
  async send(to: string, message: string) { await api.post("/friends/requests", { to, message }); },
  async respond(id: string, action: "accept" | "decline") { await api.post(`/friends/requests/${id}/${action}`); },
};
