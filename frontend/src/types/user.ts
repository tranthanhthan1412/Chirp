export interface User {
  _id: string;
  username: string;
  userName?: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Friend {
  _id: string;
  userName: string;
  displayName: string;
  avatarUrl?: string;
}

export interface FriendRequest {
  _id: string;
  from: Friend | null;
  to: Friend | null;
  message?: string;
  createdAt: string;
}
