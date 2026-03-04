import { ArrowUp, X } from "lucide-react";
import { forwardRef, KeyboardEvent, useEffect, useImperativeHandle, useRef } from "react";
import { useControllable, UseControllableProps } from "use-controllable";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

// Inject keyframes for gradient animation
const injectGradientAnimation = () => {
  if (typeof document === "undefined") return;
  if (document.getElementById("spin-gradient-keyframes")) return;

  const style = document.createElement("style");
  style.id = "spin-gradient-keyframes";
  style.textContent = `
    @keyframes spin-gradient {
      0% {
        background: conic-gradient(from 0deg, #8b5cf6, #3b82f6, #06b6d4, transparent 270deg);
      }
      25% {
        background: conic-gradient(from 90deg, #8b5cf6, #3b82f6, #06b6d4, transparent 270deg);
      }
      50% {
        background: conic-gradient(from 180deg, #8b5cf6, #3b82f6, #06b6d4, transparent 270deg);
      }
      75% {
        background: conic-gradient(from 270deg, #8b5cf6, #3b82f6, #06b6d4, transparent 270deg);
      }
      100% {
        background: conic-gradient(from 360deg, #8b5cf6, #3b82f6, #06b6d4, transparent 270deg);
      }
    }
  `;
  document.head.appendChild(style);
};

export type ChatInputProps = UseControllableProps<string> & {
  /** Callback when user submits the message */
  onSubmit: (message: string) => void;
  /** Callback when user cancels the request */
  onCancel?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Disabled state */
  loading?: boolean;
  /** Custom className for the container */
  className?: string;
  /** Last sent message for recovery with arrow up */
  lastMessage?: string;
};

export interface ChatInputRef {
  focus: () => void;
}

/**
 * ChatInput component with controllable pattern
 * Can be used in controlled or uncontrolled mode
 *
 * @see https://sergiocarracedo.es/react-controllable-components/
 *
 * @example Controlled
 * const [value, setValue] = useState('')
 * <ChatInput value={value} onChange={setValue} onSubmit={handleSend} />
 *
 * @example Uncontrolled
 * <ChatInput defaultValue="" onSubmit={handleSend} />
 */
export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(function ChatInput(
  {
    onSubmit,
    onCancel,
    placeholder = "Type your message...",
    loading,
    className,
    lastMessage,
    ...props
  },
  ref,
) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Inject animation keyframes
  useEffect(() => {
    injectGradientAnimation();
  }, []);

  // Expose focus method to parent
  useImperativeHandle(ref, () => ({
    focus: () => {
      textareaRef.current?.focus();
    },
  }));

  const [value, setValue] = useControllable({
    value: props.value,
    defaultValue: props.defaultValue ?? "",
    onChange: props.onChange,
  });

  const handleChange = (newValue: string) => {
    setValue(newValue);
  };

  const handleSubmit = () => {
    const trimmed = value || "".trim();
    if (!trimmed || loading) return;

    onSubmit(trimmed);

    setValue(""); // Clear input after submit
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    // Arrow up to recover last message (only when textarea is empty)
    if (e.key === "ArrowUp" && !value?.trim() && lastMessage) {
      e.preventDefault();
      setValue(lastMessage);
    }
  };

  return (
    <div className={className}>
      <div className="relative">
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          className="min-h-19 max-h-32 resize-none"
        />
        <div className="absolute bottom-1 right-1">
          <div
            className={loading ? "relative p-[2px] rounded-md" : ""}
            style={
              loading
                ? {
                    background:
                      "conic-gradient(from 0deg, #8b5cf6, #3b82f6, #06b6d4, transparent 270deg)",
                    animation: "spin-gradient 1.5s linear infinite",
                  }
                : undefined
            }
          >
            <Button
              onClick={loading ? handleCancel : handleSubmit}
              disabled={!loading && !value?.trim()}
              size="icon"
              className={loading ? "bg-white dark:bg-gray-900" : ""}
            >
              {loading ? <X className="h-3 w-3" /> : <ArrowUp className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});
