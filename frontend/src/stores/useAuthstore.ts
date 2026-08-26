import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";


export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    clearState: () => {
        set({ accessToken: null, user: null, loading: false });
    },

    signUp: async (username, password, email, firstName, lastName) => {
        try {
            set({ loading: true });

            // Gọi API đăng ký
            await authService.signUp(username, password, email, firstName, lastName);

            toast.success("Đăng ký thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.");
        } catch (error: any) {
            console.error("Lỗi khi đăng ký:", error);
            const errorMessage = error?.response?.data?.message || "Đăng ký thất bại, vui lòng thử lại!";
            toast.error(errorMessage);
            throw error; // Re-throw để component gọi nó có thể xử lý tiếp (ví dụ: chuyển trang)
        } finally {
            set({ loading: false });
        }
    },

    signIn: async (username, password) => {
        try {
            set({ loading: true });

            const { accessToken } = await authService.signIn(username, password)
            set({ accessToken });

            toast.success("Đăng nhập thành công! Chào mừng bạn đã quay trở lại.");

        } catch (error: any) {
            console.error("Lỗi khi đăng nhập:", error);
            const errorMessage = error?.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại!";
            toast.error(errorMessage);
            throw error; // Re-throw để component gọi nó có thể xử lý tiếp (ví dụ: chuyển trang)
        } finally {
            set({ loading: false });
        }
    },

    signOut: async () => {
        try {
            get().clearState();
            await authService.signOut();
            toast.success("Đăng xuất thành công!");
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            toast.error("Đăng xuất thất bại, vui lòng thử lại!");
        }
    }
}));
