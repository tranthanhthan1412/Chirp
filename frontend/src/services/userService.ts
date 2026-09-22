import api from "@/lib/axios";
import type { User } from "@/types/user";

export const userService = {
  async update(values: Pick<User, "displayName" | "bio" | "phone">): Promise<User> {
    return (await api.patch("/users/me", values)).data.user;
  },
  async uploadAvatar(file: File): Promise<User> {
    const data = new FormData();
    data.append("avatar", file);
    // Trình duyệt tự thêm boundary; không tự đặt Content-Type cho FormData.
    return (await api.post("/users/me/avatar", data)).data.user;
  },
};
