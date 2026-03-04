import { EyeOff, Pin, X, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChatInput, ChatInputRef, ErrorMessage, Tooltip } from "../../shared/components";
import { Button } from "../../shared/components/ui/button";

interface InlineChatAppProps {
  fieldLabel?: string;
  fieldId?: string;
  skills?: Array<{ name: string; description: string }>;
  isDarkMode?: boolean;
  draft?: string | null;
  selection?: {
    selectedText: string;
    range: { start: number; end: number };
  } | null;
}

export function InlineChatApp({
  fieldLabel = "Input field",
  fieldId,
  skills = [],
  isDarkMode = false,
  draft = null,
  selection = null,
}: InlineChatAppProps) {
  const [message, setMessage] = useState(draft || "");
  const [status, setStatus] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isError, setIsError] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [lastMessage, setLastMessage] = useState<string>("");
  const [currentSelection] = useState(selection);
  const [isSticky, setIsSticky] = useState(false);
  const chatInputRef = useRef<ChatInputRef>(null);

  // Auto-focus input when component mounts
  useEffect(() => {
    chatInputRef.current?.focus();
  }, []);

  useEffect(() => {
    // Load logo from extension resources
    if (typeof chrome !== "undefined" && chrome.runtime) {
      setLogoUrl(chrome.runtime.getURL("icons/logo.svg"));
    }
  }, []);

  useEffect(() => {
    // Listen for messages from parent
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "sireno-chat-status") {
        const { status, isError } = event.data;
        setStatus(status || "");
        setIsError(isError || false);

        if (status === "" || status === "Done!" || isError) {
          setIsProcessing(false);
        }
      } else if (event.data?.type === "sireno-save-draft-and-close") {
        // Parent is requesting us to save draft and close
        handleSaveDraftAndClose();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]); // Add message as dependency so we always have latest value

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isProcessing) return;

    // Store last message for recovery with arrow up
    setLastMessage(trimmedMessage);

    // Send to parent with selection info if any
    window.parent.postMessage(
      {
        type: "sireno-chat",
        action: "send",
        message: trimmedMessage,
        selection: selection, // Include selection info
      },
      "*",
    );

    setMessage("");
    setIsProcessing(true);
    setStatus("Processing...");
    setIsError(false);
  };

  const handleCancel = () => {
    if (!isProcessing) return;

    // Send cancel request to parent
    window.parent.postMessage(
      {
        type: "sireno-chat",
        action: "cancel",
      },
      "*",
    );

    // Restore the last message so user can edit and retry
    setMessage(lastMessage);
    setIsProcessing(false);
    setStatus("");
    setIsError(false);
  };

  const handleClose = () => {
    // Save draft if there's unsent content
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      window.parent.postMessage(
        {
          type: "sireno-chat",
          action: "save-draft",
          draftContent: trimmedMessage,
        },
        "*",
      );
    } else {
      // No content, just close
      window.parent.postMessage(
        {
          type: "sireno-chat",
          action: "close",
        },
        "*",
      );
    }
  };

  const handleSaveDraftAndClose = () => {
    // Called by parent when click outside is detected
    const trimmedMessage = message.trim();
    window.parent.postMessage(
      {
        type: "sireno-chat",
        action: "save-draft",
        draftContent: trimmedMessage,
      },
      "*",
    );
  };

  // TODO: Re-enable when sidebar continuation is fixed
  // const handleContinueInSidebar = () => {
  //   window.parent.postMessage({
  //     type: 'sireno-chat',
  //     action: 'continue-in-sidebar',
  //     fieldId,
  //     inputText: message.trim(),
  //   }, '*')
  // }

  const handleOpenSkills = () => {
    window.parent.postMessage(
      {
        type: "sireno-chat",
        action: "open-skills",
      },
      "*",
    );
  };

  const handleExcludeField = () => {
    if (!fieldId) return;
    window.parent.postMessage(
      {
        type: "sireno-chat",
        action: "exclude-field",
        fieldId,
        fieldLabel,
      },
      "*",
    );
  };

  const handleStickyToggle = () => {
    const newStickyValue = !isSticky;
    setIsSticky(newStickyValue);
    window.parent.postMessage(
      {
        type: "sireno-chat",
        action: "sticky-mode-changed",
        isSticky: newStickyValue,
      },
      "*",
    );
  };

  const handleDragStart = (e: React.MouseEvent) => {
    // Prevent text selection during drag
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling up

    console.log("[InlineChatApp] handleDragStart called", e.clientX, e.clientY);

    // We need to pass:
    // 1. offsetX/offsetY: where the user clicked within the iframe (to keep cursor at click point)
    const offsetX = e.clientX;
    const offsetY = e.clientY;

    console.log("[InlineChatApp] Sending drag-start message with offset", offsetX, offsetY);

    // Send drag start event to parent immediately
    window.parent.postMessage(
      {
        type: "sireno-chat",
        action: "drag-start",
        offsetX,
        offsetY,
      },
      "*",
    );
  };

  const activeSkillsCount = skills.length;

  return (
    <div className={`flex flex-col h-screen ${isDarkMode ? "dark" : ""}`}>
      {/* Compact Single-Line Header */}
      <div
        role="toolbar"
        className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex-shrink-0 h-10 cursor-move"
        onMouseDown={handleDragStart}
      >
        {/* Logo + Title */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {logoUrl && <img src={logoUrl} alt="Sireno" className="h-4 w-4 flex-shrink-0" />}
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            Sireno • {fieldLabel}
          </span>
        </div>

        {/* Skills Badge */}
        {activeSkillsCount > 0 && (
          <Tooltip
            content={
              <div className="text-left">
                <p className="font-semibold mb-1">
                  {activeSkillsCount} active skill{activeSkillsCount !== 1 ? "s" : ""}
                </p>
                {skills.map((skill, i) => (
                  <div
                    key={i}
                    className="text-xs text-gray-300 dark:text-gray-600 dark:text-gray-300"
                  >
                    • {skill.name}
                  </div>
                ))}
                {/* <p className="text-xs text-gray-700 dark:text-gray-200 mt-1">Click to manage</p> */}
              </div>
            }
            placement="bottom"
          >
            <button
              onClick={handleOpenSkills}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors whitespace-nowrap"
            >
              <Zap className="h-3 w-3" />
              {activeSkillsCount}
            </button>
          </Tooltip>
        )}

        {/* Sticky Mode Toggle */}
        <Tooltip
          content={
            isSticky
              ? "Disable sticky mode (allow close on outside click)"
              : "Enable sticky mode (prevent close on outside click)"
          }
          placement="bottom"
        >
          <Button
            variant="ghost"
            size="xs-icon"
            onClick={handleStickyToggle}
            className={`flex-shrink-0 h-6 w-6 ${
              isSticky
                ? "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/30"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            <Pin className={`h-3.5 w-3.5 ${isSticky ? "fill-current" : ""}`} />
          </Button>
        </Tooltip>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="xs-icon"
          onClick={handleClose}
          className="flex-shrink-0 h-6 w-6 opacity-100 text-gray-700 dark:text-gray-300"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Compact Main Content */}
      <div className="flex-1 flex flex-col justify-center px-4 py-4 bg-white dark:bg-gray-900">
        <div className="space-y-2">
          {/* Selection indicator */}
          {currentSelection && (
            <div className="text-xs bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-400 px-2 py-1 rounded border border-violet-200 dark:border-violet-800">
              ✂️ Editing selection: &quot;
              {currentSelection.selectedText.length > 50
                ? currentSelection.selectedText.substring(0, 50) + "..."
                : currentSelection.selectedText}
              &quot;
            </div>
          )}

          {/* Chat Input */}
          <ChatInput
            ref={chatInputRef}
            value={message}
            onChange={setMessage}
            onSubmit={handleSend}
            onCancel={handleCancel}
            placeholder="e.g., Write a professional greeting..."
            loading={isProcessing}
            lastMessage={lastMessage}
          />

          {/* Action Links */}
          <div className="flex justify-between items-center">
            <Tooltip content="Hide assistant button for this field" placement="top">
              <button
                onClick={handleExcludeField}
                className="text-xs text-gray-700 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 hover:underline flex items-center gap-1"
              >
                <EyeOff className="h-3 w-3" />
                Exclude field
              </button>
            </Tooltip>
            {/* TODO: Re-enable when sidebar continuation is fixed */}
            {/* <button
              onClick={handleContinueInSidebar}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Continue in sidebar →
            </button> */}
          </div>

          {/* Subtle Status Messages */}
          {isError && status && <ErrorMessage error={status} subtle />}
        </div>
      </div>
    </div>
  );
}
