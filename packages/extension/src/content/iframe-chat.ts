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
let currentRequestId: string | null = null; // Track current LLM request for cancellation
let fieldOverlay: HTMLDivElement | null = null; // Purple field outline overlay
let viewportArrow: HTMLDivElement | null = null; // Arrow indicator when field is out of viewport
let fieldIntersectionObserver: IntersectionObserver | null = null; // Track field visibility
let iframeOffset: { x: number; y: number } = { x: 0, y: 0 }; // Custom drag offset
let currentSelection: {
  // Track current selection for selection-only mode
  selectedText: string;
  range: { start: number; end: number };
} | null = null;
let dragMouseMoveHandler: ((event: MouseEvent) => void) | null = null; // Track drag mouse move handler
let dragMouseUpHandler: ((event: MouseEvent) => void) | null = null; // Track drag mouse up handler
let isDragging = false; // Prevent multiple simultaneous drags
let isStickyMode = false; // Track sticky mode (prevents click-outside close)

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
 * Show reload notification when extension context is invalid (orange warning)
 */
function showReloadNotification() {
  // Don't show multiple notifications
  if (document.querySelector("[data-sireno-reload-notification]")) {
    return;
  }

  const notification = document.createElement("div");
  notification.setAttribute("data-sireno-reload-notification", "true");
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(249, 115, 22, 0.4);
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.3s ease;
  `;
  notification.textContent = "⚠️ Sireno Assistant needs to reload. Click here to reload the page.";
  notification.addEventListener("click", () => {
    window.location.reload();
  });

  document.body.appendChild(notification);

  // Stay until clicked (no auto-dismiss)
}

/**
 * Safe wrapper for chrome.runtime.sendMessage
 */
async function safeSendMessage(message: any): Promise<any> {
  if (!isExtensionContextValid()) {
    logger.warn("[IFrame Chat] Extension context invalidated");
    showReloadNotification();
    return null;
  }

  try {
    return await chrome.runtime.sendMessage(message);
  } catch (error: any) {
    if (error.message?.includes("Extension context invalidated")) {
      logger.warn("[IFrame Chat] Extension was reloaded");
      showReloadNotification();
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
 * Capture current text selection in the field
 */
function captureSelection(
  field: HTMLElement,
): { selectedText: string; range: { start: number; end: number } } | null {
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    const start = field.selectionStart;
    const end = field.selectionEnd;

    if (start !== null && end !== null && start !== end) {
      const selectedText = field.value.substring(start, end);
      return { selectedText, range: { start, end } };
    }
  } else {
    // Handle contenteditable
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);

      // Check if selection is within the field
      if (field.contains(range.commonAncestorContainer)) {
        const selectedText = range.toString();

        // For contenteditable, we'll store the range offsets
        // This is approximate but works for simple cases
        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(field);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const end = start + selectedText.length;

        return { selectedText, range: { start, end } };
      }
    }
  }

  return null;
}

/**
 * Open inline chat for a field
 */
export async function openInlineChat(fieldId: string, field: HTMLElement, fieldLabel?: string) {
  try {
    logger.info("[IFrame Chat] Opening chat for field:", fieldId, fieldLabel);

    // Close existing chat if open
    if (activeIframe) {
      logger.debug("[IFrame Chat] Closing existing chat before opening new one");
      closeInlineChat();
    }

    activeField = field;
    activeFieldId = fieldId;

    // Notify content script that inline chat is opening for this field
    window.postMessage(
      {
        type: "INLINE_CHAT_OPENED",
        fieldId,
      },
      "*",
    );

    // Capture current selection if any
    currentSelection = captureSelection(field);
    if (currentSelection) {
      logger.debug(
        "[IFrame Chat] Captured selection:",
        currentSelection.selectedText.substring(0, 50),
      );
    }

    // Load skills
    logger.debug("[IFrame Chat] Loading active skills...");
    await loadActiveSkills();
    logger.debug("[IFrame Chat] Active skills loaded:", activeSkills.length);

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
      logger.debug("[IFrame Chat] Dark mode:", isDarkMode, "(theme:", theme, ")");
    } catch (error) {
      logger.error("[IFrame Chat] Failed to detect theme, using system default:", error);
      isDarkMode = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    // Highlight field
    logger.debug("[IFrame Chat] Highlighting field");
    highlightField(field);

    // Create purple overlay around field
    logger.debug("[IFrame Chat] Creating field overlay");
    createFieldOverlay(field);

    // Setup field visibility tracking
    logger.debug("[IFrame Chat] Setting up field visibility tracking");
    setupFieldVisibilityTracking(field);

    // Create iframe with fieldId
    logger.debug("[IFrame Chat] Creating iframe");
    createIFrame(field, fieldLabel || "Input field", fieldId);
    logger.info("[IFrame Chat] Chat opened successfully");
  } catch (error) {
    logger.error("[IFrame Chat] Failed to open chat:", error);
    // Clean up on error
    if (activeField) {
      unhighlightField(activeField);
    }
    activeField = null;
    activeFieldId = null;
  }
}

/**
 * Close inline chat
 */
export function closeInlineChat() {
  // Store fieldId before cleanup for the notification
  const closingFieldId = activeFieldId;

  if (activeIframe) {
    activeIframe.remove();
    activeIframe = null;
  }

  if (activeField) {
    unhighlightField(activeField);
    activeField = null;
  }

  // Notify content script that inline chat is closing
  if (closingFieldId) {
    window.postMessage(
      {
        type: "INLINE_CHAT_CLOSED",
        fieldId: closingFieldId,
      },
      "*",
    );
  }

  // Clean up field overlay
  removeFieldOverlay();

  // Clean up viewport arrow
  removeViewportArrow();

  // Clean up intersection observer
  if (fieldIntersectionObserver) {
    fieldIntersectionObserver.disconnect();
    fieldIntersectionObserver = null;
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

  // Reset drag offset
  iframeOffset = { x: 0, y: 0 };
  isDragging = false;

  // Reset sticky mode
  isStickyMode = false;

  // Clean up drag handlers
  if (dragMouseMoveHandler) {
    document.removeEventListener("mousemove", dragMouseMoveHandler, true);
    dragMouseMoveHandler = null;
  }
  if (dragMouseUpHandler) {
    document.removeEventListener("mouseup", dragMouseUpHandler, true);
    window.removeEventListener("mouseup", dragMouseUpHandler, true);
    dragMouseUpHandler = null;
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
 * Create purple overlay around the target field
 */
function createFieldOverlay(field: HTMLElement) {
  // Remove existing overlay if any
  removeFieldOverlay();

  fieldOverlay = document.createElement("div");
  fieldOverlay.id = "sireno-field-overlay";
  fieldOverlay.style.cssText = `
    position: absolute;
    pointer-events: none;
    border: 3px solid #8b5cf6;
    border-radius: 4px;
    z-index: 2147483646;
    transition: all 0.15s ease-out;
  `;

  document.body.appendChild(fieldOverlay);
  updateFieldOverlayPosition(field);

  // Update overlay position on scroll/resize
  const updateHandler = () => updateFieldOverlayPosition(field);
  window.addEventListener("scroll", updateHandler, { passive: true, capture: true });
  window.addEventListener("resize", updateHandler, { passive: true });

  // Store handler for cleanup
  (fieldOverlay as any)._updateHandler = updateHandler;
}

/**
 * Update field overlay position to match field bounds
 */
function updateFieldOverlayPosition(field: HTMLElement) {
  if (!fieldOverlay) return;

  const rect = field.getBoundingClientRect();
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

  fieldOverlay.style.top = `${rect.top + scrollY}px`;
  fieldOverlay.style.left = `${rect.left + scrollX}px`;
  fieldOverlay.style.width = `${rect.width}px`;
  fieldOverlay.style.height = `${rect.height}px`;
}

/**
 * Remove field overlay
 */
function removeFieldOverlay() {
  if (fieldOverlay) {
    const updateHandler = (fieldOverlay as any)._updateHandler;
    if (updateHandler) {
      window.removeEventListener("scroll", updateHandler, true);
      window.removeEventListener("resize", updateHandler);
    }
    fieldOverlay.remove();
    fieldOverlay = null;
  }
}

/**
 * Create viewport arrow indicator when field is out of view
 */
function createViewportArrow() {
  if (!viewportArrow) {
    viewportArrow = document.createElement("div");
    viewportArrow.id = "sireno-viewport-arrow";
    viewportArrow.style.cssText = `
      position: fixed;
      width: 40px;
      height: 40px;
      background: #8b5cf6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483645;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
      transition: all 0.2s ease-out;
      pointer-events: none;
    `;
    viewportArrow.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3 L10 17 M10 3 L6 7 M10 3 L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    document.body.appendChild(viewportArrow);
  }
}

/**
 * Update viewport arrow position based on field location
 */
function updateViewportArrow(field: HTMLElement) {
  const rect = field.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  if (!viewportArrow) {
    createViewportArrow();
  }

  if (!viewportArrow) return;

  // Determine which edge and position arrow accordingly
  let top = "";
  let left = "";
  let transform = "rotate(0deg)";

  if (rect.bottom < 0) {
    // Field is above viewport
    top = "20px";
    left = `${Math.max(20, Math.min(viewportWidth - 60, rect.left + rect.width / 2))}px`;
    transform = "rotate(0deg)"; // Arrow points up
  } else if (rect.top > viewportHeight) {
    // Field is below viewport
    top = `${viewportHeight - 60}px`;
    left = `${Math.max(20, Math.min(viewportWidth - 60, rect.left + rect.width / 2))}px`;
    transform = "rotate(180deg)"; // Arrow points down
  } else if (rect.right < 0) {
    // Field is to the left
    top = `${Math.max(20, Math.min(viewportHeight - 60, rect.top + rect.height / 2))}px`;
    left = "20px";
    transform = "rotate(-90deg)"; // Arrow points left
  } else if (rect.left > viewportWidth) {
    // Field is to the right
    top = `${Math.max(20, Math.min(viewportHeight - 60, rect.top + rect.height / 2))}px`;
    left = `${viewportWidth - 60}px`;
    transform = "rotate(90deg)"; // Arrow points right
  }

  viewportArrow.style.top = top;
  viewportArrow.style.left = left;
  viewportArrow.style.transform = transform;
}

/**
 * Remove viewport arrow
 */
function removeViewportArrow() {
  if (viewportArrow) {
    viewportArrow.remove();
    viewportArrow = null;
  }
}

/**
 * Setup intersection observer to track when field enters/exits viewport
 */
function setupFieldVisibilityTracking(field: HTMLElement) {
  // Clean up existing observer
  if (fieldIntersectionObserver) {
    fieldIntersectionObserver.disconnect();
  }

  fieldIntersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Field is in viewport - remove arrow, show overlay
          removeViewportArrow();
          if (fieldOverlay) {
            fieldOverlay.style.display = "block";
          }
        } else {
          // Field is out of viewport - hide overlay, show arrow
          if (fieldOverlay) {
            fieldOverlay.style.display = "none";
          }
          updateViewportArrow(field);
        }
      });
    },
    {
      threshold: 0,
      rootMargin: "0px",
    },
  );

  fieldIntersectionObserver.observe(field);
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
    will-change: transform, top, left;
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

    // Don't close if sticky mode is enabled
    if (isStickyMode) {
      return;
    }

    const target = event.target as Node;

    // Check if click is outside iframe and outside the active field
    const clickedInsideIframe = activeIframe.contains(target);
    const clickedOnField = activeField?.contains(target);

    // Don't close if clicking on the field or iframe
    if (clickedInsideIframe || clickedOnField) {
      return;
    }

    // Ask iframe to save draft before closing
    activeIframe.contentWindow?.postMessage({ type: "sireno-save-draft-and-close" }, "*");
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
        selection: currentSelection, // Send selection info if any
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

    const { action, message: userMessage, inputText, draftContent, offsetX, offsetY } = event.data;

    console.log("[iframe-chat] Received message from iframe:", action, event.data);

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
      // Capture fresh selection from the field before sending
      currentSelection = captureSelection(activeField);
      if (currentSelection) {
        logger.debug(
          "[IFrame Chat] Captured fresh selection:",
          currentSelection.selectedText.substring(0, 50),
        );
      } else {
        logger.debug("[IFrame Chat] No selection found, will process entire field");
      }

      // Clear draft after successful send
      if (activeFieldId) {
        clearDraft(activeFieldId);
      }
      handleSendMessage(userMessage);
    } else if (action === "cancel") {
      handleCancelRequest();
    } else if (action === "drag-start") {
      console.log("[iframe-chat] Calling handleDragStart with", offsetX, offsetY);
      handleDragStart(offsetX || 0, offsetY || 0);
    } else if (action === "drag-end") {
      handleDragEnd();
    } else if (action === "sticky-mode-changed") {
      isStickyMode = event.data.isSticky;
      logger.debug("[IFrame Chat] Sticky mode changed:", isStickyMode);
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

  // Generate unique request ID for this request
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  currentRequestId = requestId;

  try {
    // Get field value and check if it's rich text
    const fieldData = getFieldValue(activeField);

    // Send to LLM
    const response = await safeSendMessage({
      type: "RUN_INLINE_LLM",
      requestId,
      fieldId: activeFieldId,
      instruction: userMessage,
      currentValue: fieldData.value,
      isRichText: fieldData.isRichText,
      selectedText: currentSelection?.selectedText,
      selectionRange: currentSelection?.range,
    });

    // Check if request was cancelled
    if (currentRequestId !== requestId) {
      logger.debug("[IFrame Chat] Request was cancelled");
      return;
    }

    if (response?.type === "INLINE_LLM_COMPLETE") {
      const newValue = response.newValue;

      // Apply to field (with selection if in selection-only mode)
      applyValueToField(activeField, newValue, fieldData.isRichText, currentSelection);

      // Clear selection after applying
      currentSelection = null;

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
    // Check if request was cancelled
    if (currentRequestId !== requestId) {
      logger.debug("[IFrame Chat] Request was cancelled during processing");
      return;
    }

    logger.error("[IFrame Chat] Error sending message:", error);
    sendStatusToIFrame("Sorry, something went wrong. Please try again.", true);
  } finally {
    // Clear request ID if it's still our request
    if (currentRequestId === requestId) {
      currentRequestId = null;
    }
  }
}

/**
 * Handle cancelling the current request
 */
function handleCancelRequest() {
  if (!currentRequestId) return;

  logger.debug("[IFrame Chat] Cancelling request:", currentRequestId);

  // Send cancel message to background
  safeSendMessage({
    type: "CANCEL_INLINE_LLM",
    requestId: currentRequestId,
  });

  // Clear current request ID
  currentRequestId = null;

  // Update status in iframe
  sendStatusToIFrame("", false);
}

/**
 * Handle drag start - setup mouse event handlers on parent window
 * @param offsetX - Mouse X position relative to iframe (where user clicked within iframe)
 * @param offsetY - Mouse Y position relative to iframe (where user clicked within iframe)
 */
function handleDragStart(offsetX: number, offsetY: number) {
  if (!activeIframe || !activeField) return;

  // Prevent multiple simultaneous drags
  if (isDragging) {
    console.log("[iframe-chat] Already dragging, ignoring duplicate drag-start");
    return;
  }

  isDragging = true;
  console.log("[iframe-chat] Starting drag with offset", offsetX, offsetY);

  // TEST: Add a global listener to see if ANY mouseup fires
  const testMouseUp = (e: MouseEvent) => {
    console.log("[iframe-chat] GLOBAL mouseup detected!", e.target, e.button, e.type);
  };
  document.addEventListener("mouseup", testMouseUp, true);
  window.addEventListener("mouseup", testMouseUp, true);
  setTimeout(() => {
    document.removeEventListener("mouseup", testMouseUp, true);
    window.removeEventListener("mouseup", testMouseUp, true);
  }, 10000); // Remove after 10 seconds

  // Clean up any existing drag handlers first (in case drag wasn't properly ended)
  if (dragMouseMoveHandler) {
    document.removeEventListener("mousemove", dragMouseMoveHandler, true);
    dragMouseMoveHandler = null;
  }
  if (dragMouseUpHandler) {
    document.removeEventListener("mouseup", dragMouseUpHandler, true);
    window.removeEventListener("mouseup", dragMouseUpHandler, true);
    dragMouseUpHandler = null;
  }

  // Disable transition during drag for instant feedback
  activeIframe.style.transition = "none";
  activeIframe.style.willChange = "transform"; // Hint to browser for optimization

  // Disable position updates during drag
  if (positionUpdateHandler) {
    window.removeEventListener("scroll", positionUpdateHandler, true);
    window.removeEventListener("resize", positionUpdateHandler);
  }

  // Store the offset from where user clicked within the iframe
  const clickOffsetX = offsetX;
  const clickOffsetY = offsetY;

  // Use requestAnimationFrame for smooth updates
  let rafId: number | null = null;
  let pendingX: number | null = null;
  let pendingY: number | null = null;

  const updatePosition = () => {
    if (!activeIframe || pendingX === null || pendingY === null) return;

    activeIframe.style.left = `${pendingX}px`;
    activeIframe.style.top = `${pendingY}px`;

    pendingX = null;
    pendingY = null;
    rafId = null;
  };

  // Add mouse move handler on parent window
  dragMouseMoveHandler = (moveEvent: MouseEvent) => {
    if (!activeIframe) return;

    // Check if mouse button is still pressed (button 0 = left mouse button)
    // When dragging, buttons should be 1 (binary 001 = left button pressed)
    if (moveEvent.buttons === 0) {
      // Mouse button was released!
      console.log("[iframe-chat] Mouse button released during move, ending drag");
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      handleDragEnd();
      return;
    }

    // Get current scroll position (cache these to avoid repeated DOM queries)
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;

    // Calculate new position: mouse position minus the click offset
    // This ensures the point where user clicked stays under the cursor
    let newX = moveEvent.clientX + scrollX - clickOffsetX;
    let newY = moveEvent.clientY + scrollY - clickOffsetY;

    // Get iframe dimensions
    const rect = activeIframe.getBoundingClientRect();

    // Constrain to viewport bounds
    const minX = scrollX;
    const minY = scrollY;
    const maxX = scrollX + window.innerWidth - rect.width;
    const maxY = scrollY + window.innerHeight - rect.height;

    newX = Math.max(minX, Math.min(maxX, newX));
    newY = Math.max(minY, Math.min(maxY, newY));

    // Store pending position and schedule update
    pendingX = newX;
    pendingY = newY;

    if (rafId === null) {
      rafId = requestAnimationFrame(updatePosition);
    }
  };

  // Add mouse up handler on parent window
  dragMouseUpHandler = (event: MouseEvent) => {
    logger.info("[IFrame Chat] Mouse up detected!", event.type, event.button);
    handleDragEnd();
  };

  // Attach handlers to parent document
  // Use capture phase to ensure we catch events even if they're on the iframe
  document.addEventListener("mousemove", dragMouseMoveHandler, true);
  document.addEventListener("mouseup", dragMouseUpHandler, true);

  // Also add to window as a backup
  window.addEventListener("mouseup", dragMouseUpHandler, true);

  logger.debug("[IFrame Chat] Drag started with offset", clickOffsetX, clickOffsetY);
  logger.debug("[IFrame Chat] Attached mouseup listener to document and window");
}

/**
 * Handle drag end - store offset for future position updates
 */
function handleDragEnd() {
  logger.debug("[IFrame Chat] handleDragEnd called");

  if (!activeIframe || !activeField) {
    logger.warn("[IFrame Chat] handleDragEnd: No active iframe or field");
    isDragging = false;
    return;
  }

  // Remove mouse handlers
  if (dragMouseMoveHandler) {
    document.removeEventListener("mousemove", dragMouseMoveHandler, true);
    dragMouseMoveHandler = null;
    logger.debug("[IFrame Chat] Removed mousemove handler");
  }
  if (dragMouseUpHandler) {
    document.removeEventListener("mouseup", dragMouseUpHandler, true);
    window.removeEventListener("mouseup", dragMouseUpHandler, true);
    dragMouseUpHandler = null;
    logger.debug("[IFrame Chat] Removed mouseup handler");
  }

  // Re-enable transitions
  activeIframe.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
  activeIframe.style.willChange = "auto"; // Remove optimization hint

  // Re-enable position updates
  if (positionUpdateHandler) {
    window.addEventListener("scroll", positionUpdateHandler, {
      passive: true,
      capture: true,
    });
    window.addEventListener("resize", positionUpdateHandler, { passive: true });
  }

  // Calculate offset from natural position
  const naturalPos = calculateChatPosition(activeField);
  const currentLeft = parseInt(activeIframe.style.left) || 0;
  const currentTop = parseInt(activeIframe.style.top) || 0;

  iframeOffset = {
    x: currentLeft - parseInt(naturalPos.left),
    y: currentTop - parseInt(naturalPos.top),
  };

  isDragging = false;
  logger.debug("[IFrame Chat] Drag ended, offset:", iframeOffset);
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
 * Get field value and detect if it contains rich text (HTML)
 */
function getFieldValue(element: HTMLElement): { value: string; isRichText: boolean } {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return { value: element.value, isRichText: false };
  }

  // For contenteditable elements, check if they contain HTML formatting
  const hasHtml =
    element.children.length > 0 || // Has child elements
    element.innerHTML !== element.textContent || // HTML differs from text
    /<br|<strong|<em|<b|<i|<u|<span|<div|<p/i.test(element.innerHTML); // Contains common formatting tags

  if (hasHtml) {
    return { value: element.innerHTML, isRichText: true };
  }

  return { value: element.textContent || "", isRichText: false };
}

/**
 * Apply value to field
 */
function applyValueToField(
  element: HTMLElement,
  value: string,
  isRichText: boolean = false,
  selection: { selectedText: string; range: { start: number; end: number } } | null = null,
) {
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    if (selection) {
      // Replace only the selected portion
      const before = element.value.substring(0, selection.range.start);
      const after = element.value.substring(selection.range.end);
      element.value = before + value + after;

      // Set cursor position at the end of the replaced text
      const newCursorPos = selection.range.start + value.length;
      element.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      // Replace entire value
      element.value = value;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (isRichText) {
    if (selection) {
      // For contenteditable with selection, we need to replace the selected portion
      // This is complex because we need to work with the DOM structure
      try {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (element.contains(range.commonAncestorContainer)) {
            // Delete the selected content
            range.deleteContents();

            // Insert the new HTML content
            const fragment = range.createContextualFragment(value);
            range.insertNode(fragment);

            // Move cursor to end of inserted content
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            // Fallback: replace entire content
            element.innerHTML = value;
          }
        } else {
          // Fallback: replace entire content
          element.innerHTML = value;
        }
      } catch (error) {
        logger.warn(
          "[IFrame Chat] Error applying selection to rich text, falling back to full replace:",
          error,
        );
        // Fallback: replace entire content
        element.innerHTML = value;
      }
    } else {
      // Replace entire HTML content
      element.innerHTML = value;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    if (selection) {
      // For plain contenteditable, replace selected text portion
      const currentText = element.textContent || "";
      const before = currentText.substring(0, selection.range.start);
      const after = currentText.substring(selection.range.end);
      element.textContent = before + value + after;
    } else {
      // Replace entire text content
      element.textContent = value;
    }
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Add gradient border animation
  addGradientBorderAnimation(element);

  // Scroll field into view and focus it
  element.scrollIntoView({ behavior: "smooth", block: "center" });

  // Focus the field after a short delay to ensure scroll completes
  setTimeout(() => {
    element.focus();
  }, 300);
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

  // Store reference to active field element BEFORE closing chat
  const fieldElementToExclude = activeField;
  const fieldIdToExclude = fieldId || activeFieldId;

  try {
    // IMPORTANT: Store in global FIRST, before sending any messages
    // This ensures the content script can access it when the message arrives
    if (fieldElementToExclude) {
      (window as any).__SIRENO_EXCLUDED_FIELD__ = fieldElementToExclude;
      logger.debug("[IFrame Chat] Stored field element in global for exclusion");
    }

    const response = await safeSendMessage({
      type: "EXCLUDE_FIELD",
      fieldId: fieldIdToExclude || "",
      fieldLabel: fieldLabel || "Unknown field",
    });

    logger.debug("[IFrame Chat] Exclude field response:", response);

    // Close the chat
    closeInlineChat();

    // Notify content script to remove the button for this field
    // The global is already set, so the listener will find it
    window.postMessage(
      {
        type: "FIELD_EXCLUDED",
        fieldId: fieldIdToExclude,
      },
      "*",
    );

    logger.debug("[IFrame Chat] Field excluded successfully:", fieldIdToExclude);
  } catch (error) {
    logger.error("[IFrame Chat] Failed to exclude field:", error);
  }
}
