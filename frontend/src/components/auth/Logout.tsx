import { useAuthStore } from "@/stores/useAuthstore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";

const Logout = () => {
    const { signOut } = useAuthStore(); // Lấy trực tiếp hàm signOut
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut();
            navigate("/signin");
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <Button variant="completeGhost" onClick={handleLogout}>
            <LogOut className="text-destructive" />
            Đăng xuất
        </Button>
    );
};

export default Logout;
