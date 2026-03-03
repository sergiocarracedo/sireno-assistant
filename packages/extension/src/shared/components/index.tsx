import { Tooltip as HeroTooltip } from "@heroui/react";
import React from "react";

// Wrap Tooltip with better contrast for dark mode
export const Tooltip = React.forwardRef<
  React.ElementRef<typeof HeroTooltip>,
  React.ComponentPropsWithoutRef<typeof HeroTooltip>
>((props, ref) => {
  return (
    <HeroTooltip
      ref={ref}
      classNames={{
        content:
          "bg-gray-900 dark:bg-gray-100 text-gray-100 dark:text-gray-900 border border-gray-700 dark:border-gray-300",
      }}
      {...props}
    />
  );
});

Tooltip.displayName = "Tooltip";

export type TooltipProps = React.ComponentProps<typeof HeroTooltip>;

export { Select, type SelectProps, type SelectOption } from "./Select";
export { ChatInput, type ChatInputProps, type ChatInputRef } from "./ChatInput";
export {
  ThinkingMessage,
  ErrorMessage,
  UserMessage,
  AssistantMessage,
  EmptyChat,
  type ThinkingMessageProps,
  type ErrorMessageProps,
  type UserMessageProps,
  type AssistantMessageProps,
  type EmptyChatProps,
} from "./ChatMessages";
