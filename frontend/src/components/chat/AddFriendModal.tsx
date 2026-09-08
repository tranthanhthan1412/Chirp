import { UserPlus } from "lucide-react";

const AddFriendModal = () => {
  return (
    <span className="flex items-center justify-center text-muted-foreground hover:text-foreground">
      <UserPlus className="size-4" />
      <span className="sr-only">Kết bạn</span>
    </span>
  );
};

export default AddFriendModal;
