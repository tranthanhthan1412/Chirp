declare module "@emoji-mart/data" {
  const data: any;
  export default data;
}

declare module "@emoji-mart/react" {
  import type { ComponentType } from "react";

  export interface PickerProps {
    data?: any;
    onEmojiSelect?: (emoji: any) => void;
    theme?: "light" | "dark" | "auto";
    emojiSize?: number;
    emojiButtonSize?: number;
    previewPosition?: "top" | "bottom" | "none";
    navPosition?: "top" | "bottom" | "none";
    searchPosition?: "sticky" | "static" | "none";
    skinTonePosition?: "preview" | "search" | "none";
    perLine?: number;
    maxFrequentRows?: number;
    locale?: string;
    [key: string]: any;
  }

  const Picker: ComponentType<PickerProps>;
  export default Picker;
}
