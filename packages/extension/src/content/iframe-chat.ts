/**
 * IFrame-based inline chat for strong isolation
 */

// Simple inline logger for content script (avoid import issues)
const IS_DEV = import.meta.env.DEV;
const logger = {
  debug: (...args: any[]) => IS_DEV && console.log("[iframe-chat]", ...args),
  info: (...args: any[]) => console.info("[iframe-chat]", ...args),
  warn: (...args: any[]) => console.warn("[iframe-chat]", ...args),
  error: (...args: any[]) => console.error("[iframe-chat]", ...args),
};

interface ActiveSkill {
  name: string;
  description: string;
}

let activeIframe: HTMLIFrameElement | null = null;
let activeField: HTMLElement | null = null;
let activeFieldId: string | null = null;
let activeSkills: ActiveSkill[] = [];
let isDarkMode = false;
let positionUpdateHandler: (() => void) | null = null;
let clickOutsideHandler: ((event: MouseEvent) => void) | null = null;

/**
 * Check if extension context is still valid
 */
function isExtensionContextValid(): boolean {
  try {
    return chrome.runtime?.id !== undefined;
  } catch {
    return false;
  }
}

/**
 * Safe wrapper for chrome.runtime.sendMessage
 */
async function safeSendMessage(message: any): Promise<any> {
  if (!isExtensionContextValid()) {
    logger.warn("[IFrame Chat] Extension context invalidated");
    return null;
  }

  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error: any) {
    if (error.message?.includes("Extension context invalidated")) {
      logger.warn("[IFrame Chat] Extension was reloaded");
      return null;
    }
    throw error;
  }
}

/**
 * Get draft key for current page and field
 */
function getDraftKey(fieldId: string): string {
  const url = window.location.href;
  return `inline_draft_${url}_${fieldId}`;
}

/**
 * Save draft to chrome storage
 */
async function saveDraft(fieldId: string, content: string) {
  try {
    const key = getDraftKey(fieldId);
    await chrome.storage.local.set({ [key]: content });
    logger.debug("[IFrame Chat] Draft saved for field:", fieldId);
  } catch (error) {
    logger.error("[IFrame Chat] Failed to save draft:", error);
  }
}

/**
 * Load draft from chrome storage
 */
async function loadDraft(fieldId: string): Promise<string | null> {
  try {
    const key = getDraftKey(fieldId);
    const result = await chrome.storage.local.get(key);
    const draft = result[key] || null;
    if (draft) {
      logger.debug("[IFrame Chat] Draft loaded for field:", fieldId);
    }
    return draft;
  } catch (error) {
    logger.error("[IFrame Chat] Failed to load draft:", error);
    return null;
  }
}

/**
 * Clear draft from chrome storage
 */
async function clearDraft(fieldId: string) {
  try {
    const key = getDraftKey(fieldId);
    await chrome.storage.local.remove(key);
    logger.debug("[IFrame Chat] Draft cleared for field:", fieldId);
  } catch (error) {
    logger.error("[IFrame Chat] Failed to clear draft:", error);
  }
}

/**
 * Get disabled skill IDs from storage
 */
async function getDisabledSkillIds(): Promise<string[]> {
  try {
    const allItems = await chrome.storage.local.get(null);
    const disabledIds: string[] = [];

    for (const key in allItems) {
      if (key.startsWith("skill_disabled_") && allItems[key] === true) {
        const skillId = key.replace("skill_disabled_", "");
        disabledIds.push(skillId);
      }
    }

    return disabledIds;
  } catch (error) {
    logger.error("[IFrame Chat] Failed to get disabled skill IDs:", error);
    return [];
  }
}

/**
 * Load active skills for current page
 */
async function loadActiveSkills(): Promise<void> {
  try {
    const response = await safeSendMessage({
      type: "GET_SKILLS",
      url: window.location.href,
    });
    if (response?.type === "SKILLS_RESPONSE") {
      // Filter out disabled skills
      const allSkills = response.skills || [];
      const disabledIds = await getDisabledSkillIds();
      activeSkills = allSkills.filter(
        (skill: ActiveSkill & { id: string }) => !disabledIds.includes(skill.id),
      );
      logger.debug(
        "[IFrame Chat] Loaded",
        activeSkills.length,
        "active skills (filtered out",
        disabledIds.length,
        "disabled)",
      );
    }
  } catch (error) {
    logger.error("[IFrame Chat] Failed to load skills:", error);
    activeSkills = [];
  }
}

/**
 * Open inline chat for a field
 */
export async function openInlineChat(fieldId: string, field: HTMLElement, fieldLabel?: string) {
  logger.debug("[IFrame Chat] Opening chat for field:", fieldId);

  // Close existing chat if open
  if (activeIframe) {
    closeInlineChat();
  }

  activeField = field;
  activeFieldId = fieldId;

  // Load skills
  await loadActiveSkills();

  // Detect dark mode: check stored theme preference, fall back to system
  try {
    const stored = await chrome.storage.local.get("ui_theme");
    const theme = stored["ui_theme"] as string | undefined;
    if (theme === "dark") {
      isDarkMode = true;
    } else if (theme === "light") {
      isDarkMode = false;
    } else {
      // 'system' or unset — use OS preference
      isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
  } catch {
    isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  // Highlight field
  highlightField(field);

  // Create iframe with fieldId
  createIFrame(field, fieldLabel || "Input field", fieldId);
}

/**
 * Close inline chat
 */
export function closeInlineChat() {
  if (activeIframe) {
    activeIframe.remove();
    activeIframe = null;
  }

  if (activeField) {
    unhighlightField(activeField);
    activeField = null;
  }

  // Clean up position tracking
  if (positionUpdateHandler) {
    window.removeEventListener("scroll", positionUpdateHandler, true);
    window.removeEventListener("resize", positionUpdateHandler);
    positionUpdateHandler = null;
  }

  // Clean up click-outside handler
  if (clickOutsideHandler) {
    document.removeEventListener("click", clickOutsideHandler, true);
    clickOutsideHandler = null;
  }

  activeFieldId = null;

  logger.debug("[IFrame Chat] Chat closed");
}

/**
 * Highlight the target field
 */
function highlightField(element: HTMLElement) {
  element.style.outline = "3px solid #667eea";
  element.style.outlineOffset = "2px";
  element.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.2)";
}

/**
 * Remove highlight from field
 */
function unhighlightField(element: HTMLElement) {
  element.style.outline = "";
  element.style.outlineOffset = "";
  element.style.boxShadow = "";
}

/**
 * Calculate optimal position for chat near field
 * Uses absolute positioning (scrolls with page)
 */
function calculateChatPosition(field: HTMLElement): {
  top: string;
  left: string;
  placement: "above" | "below" | "right";
} {
  const rect = field.getBoundingClientRect();
  const chatWidth = 500;
  const chatHeight = 180;
  const gap = 12; // pixels between field and chat

  // Check available space
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const spaceRight = window.innerWidth - rect.right;

  let top: number;
  let left: number;
  let placement: "above" | "below" | "right";

  // Priority: below → above → right
  if (spaceBelow >= chatHeight + gap) {
    // Position below field
    placement = "below";
    top = rect.bottom + window.scrollY + gap;
    left = rect.left + window.scrollX;
  } else if (spaceAbove >= chatHeight + gap) {
    // Position above field
    placement = "above";
    top = rect.top + window.scrollY - chatHeight - gap;
    left = rect.left + window.scrollX;
  } else if (spaceRight >= chatWidth + gap) {
    // Position to the right
    placement = "right";
    top = rect.top + window.scrollY;
    left = rect.right + window.scrollX + gap;
  } else {
    // Fallback: position below (best effort)
    placement = "below";
    top = rect.bottom + window.scrollY + gap;
    left = rect.left + window.scrollX;
  }

  // Ensure chat stays within viewport (10px margin)
  const minLeft = window.scrollX + 10;
  const maxLeft = window.scrollX + window.innerWidth - chatWidth - 10;
  const minTop = window.scrollY + 10;
  const maxTop = window.scrollY + window.innerHeight - chatHeight - 10;

  left = Math.max(minLeft, Math.min(left, maxLeft));
  top = Math.max(minTop, Math.min(top, maxTop));

  return {
    top: `${top}px`,
    left: `${left}px`,
    placement,
  };
}

/**
 * Create iframe with React-based chat UI
 */
function createIFrame(field: HTMLElement, fieldLabel: string, fieldId: string) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("data-sireno-chat", "true");

  // Calculate initial position
  const position = calculateChatPosition(field);

  iframe.style.cssText = `
    position: absolute;
    top: ${position.top};
    left: ${position.left};
    width: 500px;
    max-width: 90vw;
    height: 180px;
    max-height: 80vh;
    border: 2px solid rgba(102, 126, 234, 0.3);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    z-index: 2147483647;
    background: ${isDarkMode ? "#1f2937" : "#ffffff"};
    opacity: 0;
    transform: scale(0.95);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  // Use the built HTML file from dist
  iframe.src = chrome.runtime.getURL("src/content/iframe-chat.html");

  // Setup communication before iframe loads
  setupIFrameCommunication(iframe, fieldLabel, fieldId);

  // Add to DOM
  document.body.appendChild(iframe);
  activeIframe = iframe;

  // Animate in after load
  iframe.onload = () => {
    requestAnimationFrame(() => {
      iframe.style.opacity = "1";
      iframe.style.transform = "scale(1)";
    });
  };

  // Setup position tracking for scroll/resize
  positionUpdateHandler = () => {
    if (activeIframe && activeField) {
      const newPosition = calculateChatPosition(activeField);
      activeIframe.style.top = newPosition.top;
      activeIframe.style.left = newPosition.left;
    }
  };

  // Use capture phase for scroll to catch all scroll events
  window.addEventListener("scroll", positionUpdateHandler, {
    passive: true,
    capture: true,
  });
  window.addEventListener("resize", positionUpdateHandler, { passive: true });

  // Setup click-outside-to-close handler
  clickOutsideHandler = (event: MouseEvent) => {
    if (!activeIframe) return;

    const target = event.target as Node;

    // Check if click is outside iframe and outside the active field
    const clickedInsideIframe = activeIframe.contains(target);
    const clickedOnField = activeField?.contains(target);

    if (!clickedInsideIframe && !clickedOnField) {
      // Ask iframe to save draft before closing
      activeIframe.contentWindow?.postMessage({ type: "sireno-save-draft-and-close" }, "*");
    }
  };

  // Add click listener after a small delay to avoid immediate closing
  setTimeout(() => {
    if (clickOutsideHandler) {
      document.addEventListener("click", clickOutsideHandler, true);
    }
  }, 100);

  logger.debug("[IFrame Chat] IFrame created and mounted");
}

/**
 * Create chat HTML content
 */
/**
 * Setup communication between iframe and parent
 */
function setupIFrameCommunication(iframe: HTMLIFrameElement, fieldLabel: string, fieldId: string) {
  // Wait for iframe to signal it's ready, then send init data
  const handleReady = async (event: MessageEvent) => {
    if (event.source !== iframe.contentWindow) return;
    if (event.data?.type !== "sireno-iframe-ready") return;

    // Load draft for this field
    const draft = await loadDraft(fieldId);

    // Send initialization data to React app
    iframe.contentWindow?.postMessage(
      {
        type: "sireno-init",
        fieldLabel,
        fieldId,
        skills: activeSkills,
        isDarkMode,
        draft, // Send draft to iframe
      },
      "*",
    );

    // Remove ready listener
    window.removeEventListener("message", handleReady);
  };

  window.addEventListener("message", handleReady);

  // Listen for messages from iframe
  const handleMessages = (event: MessageEvent) => {
    // Verify message is from our iframe
    if (event.source !== iframe.contentWindow) return;
    if (event.data?.type !== "sireno-chat") return;

    const { action, message: userMessage, inputText, draftContent } = event.data;

    if (action === "close") {
      closeInlineChat();
      window.removeEventListener("message", handleMessages);
    } else if (action === "save-draft") {
      // Save draft to storage
      if (draftContent !== undefined && activeFieldId) {
        if (draftContent.trim()) {
          saveDraft(activeFieldId, draftContent);
        } else {
          clearDraft(activeFieldId);
        }
      }
      closeInlineChat();
      window.removeEventListener("message", handleMessages);
    } else if (action === "send" && userMessage && activeFieldId && activeField) {
      // Clear draft after successful send
      if (activeFieldId) {
        clearDraft(activeFieldId);
      }
      handleSendMessage(userMessage);
    } else if (action === "continue-in-sidebar") {
      handleContinueInSidebar(event.data.fieldId, inputText);
      window.removeEventListener("message", handleMessages);
    } else if (action === "open-skills") {
      handleOpenSkills();
      window.removeEventListener("message", handleMessages);
    } else if (action === "exclude-field") {
      handleExcludeField(event.data.fieldId, event.data.fieldLabel);
      window.removeEventListener("message", handleMessages);
    }
  };

  window.addEventListener("message", handleMessages);
}

/**
 * Handle sending a message
 */
async function handleSendMessage(userMessage: string) {
  if (!activeFieldId || !activeField) return;

  logger.debug("[IFrame Chat] Processing instruction:", userMessage);

  try {
    // Send to LLM
    const response = await safeSendMessage({
      type: "RUN_INLINE_LLM",
      fieldId: activeFieldId,
      instruction: userMessage,
      currentValue: getFieldValue(activeField),
    });

    if (response?.type === "INLINE_LLM_COMPLETE") {
      const newValue = response.newValue;

      // Apply to field
      applyValueToField(activeField, newValue);

      // Show success status
      sendStatusToIFrame("Done!", false);

      // Close after a short delay
      setTimeout(() => {
        closeInlineChat();
      }, 800);
    } else if (response?.type === "LLM_ERROR") {
      sendStatusToIFrame(`Error: ${response.error}`, true);
    }
  } catch (error) {
    logger.error("[IFrame Chat] Error sending message:", error);
    sendStatusToIFrame("Sorry, something went wrong. Please try again.", true);
  }
}

/**
 * Send status update to iframe
 */
function sendStatusToIFrame(status: string, isError: boolean = false) {
  if (!activeIframe || !activeIframe.contentWindow) return;

  activeIframe.contentWindow.postMessage(
    {
      type: "sireno-chat-status",
      status,
      isError,
    },
    "*",
  );
}

/**
 * Get field value
 */
function getFieldValue(element: HTMLElement): string {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  return element.textContent || "";
}

/**
 * Apply value to field
 */
function applyValueToField(element: HTMLElement, value: string) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.value = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  } else {
    element.textContent = value;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Add gradient border animation
  addGradientBorderAnimation(element);
}

/**
 * Add animated gradient border to field after AI update
 * Uses a temporary overlay element with animated gradient border
 * Gradient sweeps from violet → blue → cyan → transparent over 0.7 seconds
 */
function addGradientBorderAnimation(element: HTMLElement) {
  // Inject CSS if not already present
  if (!document.getElementById("sireno-gradient-animation")) {
    const style = document.createElement("style");
    style.id = "sireno-gradient-animation";
    style.textContent = `
      @keyframes sireno-gradient-sweep {
        0% {
          background-position: 0% 0%;
        }
        100% {
          background-position: 200% 0%;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Create overlay element
  const overlay = document.createElement("div");
  overlay.setAttribute("data-sireno-animation", "true");

  overlay.style.cssText = `
    position: absolute;
    pointer-events: none;
    z-index: 2147483646;
    border-radius: 4px;
    padding: 3px;
    box-sizing: border-box;
    border-image-sorurce: linear-gradient(
      90deg,
      #8b5cf6 0%,
      #3b82f6 25%,
      #06b6d4 50%,
      transparent 75%,
      transparent 100%
    );
    background-size: 200% 100%;
    background-position: 0% 0%;
    animation: sireno-gradient-sweep 0.5s ease-out forwards;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  `;

  // Create inner element to "cut out" the center (creating border effect)
  const inner = document.createElement("div");
  inner.style.cssText = `
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 2px;
  `;
  overlay.appendChild(inner);

  // Position overlay over field
  const updateOverlayPosition = () => {
    if (!document.body.contains(element)) {
      // Element was removed, clean up overlay
      overlay.remove();
      return;
    }

    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    const borderRadius = computedStyle.borderRadius || "4px";

    overlay.style.top = `${rect.top + window.scrollY}px`;
    overlay.style.left = `${rect.left + window.scrollX}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.borderRadius = borderRadius;

    // Inner border radius should be slightly smaller
    const radiusValue = parseInt(borderRadius) || 4;
    inner.style.borderRadius = `${Math.max(0, radiusValue - 2)}px`;
  };

  updateOverlayPosition();
  document.body.appendChild(overlay);

  // Fade in
  requestAnimationFrame(() => {
    overlay.style.opacity = "0.5";
  });

  // Update position on scroll/resize
  const handleUpdate = () => updateOverlayPosition();
  window.addEventListener("scroll", handleUpdate, {
    passive: true,
    capture: true,
  });
  window.addEventListener("resize", handleUpdate, { passive: true });

  // Remove after animation completes (0.5s animation + 200ms fade-out)
  setTimeout(() => {
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.remove();
      window.removeEventListener("scroll", handleUpdate);
      window.removeEventListener("resize", handleUpdate);
    }, 200); // Wait for fade-out
  }, 500); // 0.7 seconds
}

/**
 * Handle "Continue in sidebar" action
 */
async function handleContinueInSidebar(fieldId: string | undefined, inputText: string) {
  try {
    await safeSendMessage({
      type: "OPEN_SIDEBAR_CHAT",
      fieldId: fieldId || activeFieldId,
      inputText,
    });
    closeInlineChat();
  } catch (error) {
    logger.error("[IFrame Chat] Failed to open sidebar:", error);
  }
}

/**
 * Handle "Open skills" action
 */
async function handleOpenSkills() {
  try {
    await safeSendMessage({
      type: "OPEN_SIDEBAR_SKILLS",
    });
    closeInlineChat();
  } catch (error) {
    logger.error("[IFrame Chat] Failed to open skills:", error);
  }
}

/**
 * Handle "Exclude field" action
 */
async function handleExcludeField(fieldId: string | undefined, fieldLabel: string | undefined) {
  logger.debug("[IFrame Chat] Excluding field:", fieldId, fieldLabel);

  try {
    const response = await safeSendMessage({
      type: "EXCLUDE_FIELD",
      fieldId: fieldId || activeFieldId || "",
      fieldLabel: fieldLabel || "Unknown field",
    });

    logger.debug("[IFrame Chat] Exclude field response:", response);

    // Notify content script to remove the button for this field FIRST
    window.postMessage(
      {
        type: "FIELD_EXCLUDED",
        fieldId: fieldId || activeFieldId,
      },
      "*",
    );

    logger.debug("[IFrame Chat] Field excluded successfully:", fieldId);

    // Close the chat AFTER notifying content script
    closeInlineChat();
  } catch (error) {
    logger.error("[IFrame Chat] Failed to exclude field:", error);
  }
}
