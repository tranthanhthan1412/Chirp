import Logout from "@/components/auth/Logout"
import { useAuthStore } from "@/stores/useAuthstore"
import api from "@/lib/axios";
import { toast } from "sonner";
import { Button } from "@base-ui/react/button";

const ChatAppPage = () => {
    const user = useAuthStore((s) => s.user);

    const handleOnclick = async () => {
        try {
            await api.get("/users/test", { withCredentials: true });
            toast.success("Test success");
        } catch (error) {
            toast.error("Test failed");
            console.log(error);
        }
    }
    return (
        <div>
            <span>Xin chào, {user?.displayName || user?.userName}</span>
            <Logout />

            <Button onClick={handleOnclick}>Test</Button>
        </div>
    )
}

export default ChatAppPage
