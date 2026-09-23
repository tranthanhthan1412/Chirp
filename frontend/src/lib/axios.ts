import axios from "axios";
import { useAuthStore } from "@/stores/useAuthstore";

// Normalize accidental double slashes in the path without changing https://.
const baseURL = (
    import.meta.env.VITE_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:5001/api" : "/api")
).trim().replace(/([^:]\/)\/+/g, "$1");

const api = axios.create({
    baseURL,
    withCredentials: true,
});
let refreshing: Promise<string> | null = null;

// gan access token vao req header
api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config;
});

// tu dong goi refresh api khi access token het han
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // nhung api khong can check
        if (
            originalRequest.url?.includes("/auth/signin") ||
            originalRequest.url?.includes("/auth/signup") ||
            originalRequest.url?.includes("/auth/refresh")
        ) {
            return Promise.reject(error);
        }

        // 403 do chưa kết bạn/không có quyền không phải lỗi hết hạn token.
        if (error.response?.data?.code === "ACCESS_TOKEN_INVALID" && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                refreshing ??= api.post("/auth/refresh", {}).then(res => {
                    const token: string = res.data.accessToken;
                    useAuthStore.getState().setAccessToken(token);
                    return token;
                }).finally(() => { refreshing = null; });
                const newAccessToken = await refreshing;

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                useAuthStore.getState().clearState();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
