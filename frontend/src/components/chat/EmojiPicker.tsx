import { useThemeStore } from "@/stores/useThemestore";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Smile } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";

interface EmojiPickerProps {
  onChange: (value: string) => void;
}

// Component chọn biểu tượng cảm xúc Emoji sử dụng emoji-mart
const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { isDark } = useThemeStore();

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md flex items-center justify-center cursor-pointer"
        title="Chọn biểu tượng cảm xúc"
      >
        <Smile className="size-4" />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={12}
        className="w-auto p-0 bg-transparent border-none shadow-none drop-shadow-none z-50 mb-2"
      >
        <Picker
          theme={isDark ? "dark" : "light"}
          data={data}
          onEmojiSelect={(emoji: any) => onChange(emoji.native || emoji.shortcodes)}
          emojiSize={22}
          previewPosition="none"
          navPosition="bottom"
        />
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;