import { Plus } from "lucide-react";

const NewGroupChatModal = () => {
  return (
    <span className="flex items-center justify-center text-muted-foreground hover:text-foreground">
      <Plus className="size-4" />
      <span className="sr-only">Tạo nhóm mới</span>
    </span>
  );
};

export default NewGroupChatModal;
