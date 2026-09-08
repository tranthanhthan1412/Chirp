import { MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CreateNewChatProps {
  children?: React.ReactNode;
}

const CreateNewChat = ({ children }: CreateNewChatProps) => {
  return (
    <Button
      variant="outline"
      className="w-full justify-start gap-2 shadow-xs"
    >
      <MessageSquarePlus className="size-4" />
      <span>Cuộc trò chuyện mới</span>
      {children}
    </Button>
  );
};

export default CreateNewChat;
