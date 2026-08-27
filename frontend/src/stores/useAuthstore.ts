import { create } from "zustand";
import { toast } from "sonner";
import { authService } from "@/services/authService";
import type { AuthState } from "@/types/store";


export const useAuthStore = create<AuthState>((set, get) => ({
    accessToken: null,
    user: null,
    loading: false,

    setAccessToken: (accessToken: string) => {
        set({ accessToken });
    },
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
            get().setAccessToken(accessToken);

            await get().fetchMe();

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
    },

    fetchMe: async () => {
        try {
            set({ loading: true })
            const user = await authService.fetchMe();
            set({ user });
        } catch (error: any) {
            console.error("Lỗi khi fetch me:", error);
            set({ user: null, accessToken: null });
            toast.error("Lỗi xảy ra khi lấy dữ liệu người dùng. Hãy thử lại!");
        } finally {
            set({ loading: false });
        }
    },

    refresh: async () => {
        try {
            set({ loading: true })

            const { user, fetchMe, setAccessToken } = get();

            const accessToken = await authService.refresh();
            setAccessToken(accessToken);

            if (!user) {
                await fetchMe();
            }
        } catch (error: any) {
            console.error("Lỗi khi refresh token:", error);
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
            get().clearState();
        } finally {
            set({ loading: false });
        }
    }
}));
