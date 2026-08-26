import { useAuthStore } from "@/stores/useAuthstore";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

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
        <Button onClick={handleLogout}>Logout</Button>
    );
};

export default Logout;
