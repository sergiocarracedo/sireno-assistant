/**
 * Button that appears near input fields
 * Uses fixed positioning to stay visible even when fields scroll
 */

export interface AssistantButton {
  element: HTMLDivElement;
  field: HTMLElement;
  cleanup: () => void;
}

/**
 * Create an assistant button near a field
 * Uses fixed positioning relative to viewport for better scroll handling
 */
export function createAssistantButton(
  field: HTMLElement,
  _wrapper: HTMLElement, // Keep for API compatibility, but not used with fixed positioning
  onClick: (field: HTMLElement) => void,
): AssistantButton {
  const button = document.createElement("div");
  button.className = "sireno-assistant-button";
  button.setAttribute("data-sireno-button", "true");

  // Create image element for logo
  const logo = document.createElement("img");
  logo.src = chrome.runtime.getURL("icons/logo.svg");
  logo.style.cssText = `
    width: 14px;
    height: 14px;
    pointer-events: none;
  `;
  button.appendChild(logo);

  // Determine positioning based on field type
  const isTextarea = field instanceof HTMLTextAreaElement;
  const isContentEditable =
    field.getAttribute("contenteditable") !== "false" &&
    field.getAttribute("contenteditable") !== null;
  const isMultiline = isTextarea || isContentEditable;

  // Base styles - use fixed positioning for scrollable elements
  button.style.cssText = `
    position: fixed;
    width: 24px;
    height: 24px;
    cursor: pointer;
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.4);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 0;
    transform: scale(0.8);
    pointer-events: auto;
    user-select: none;
  `;

  // Calculate initial position using fixed positioning
  const updateButtonPosition = () => {
    const fieldRect = field.getBoundingClientRect();

    // Skip update if field is not visible in viewport
    if (fieldRect.width === 0 || fieldRect.height === 0) return;

    const btnSize = 24;
    const margin = 4; // px from field edges

    if (isMultiline) {
      // For scrollable/multiline fields, pin to bottom-right of the VISIBLE area of the field.
      // getBoundingClientRect() already clips to the viewport, so this stays stable
      // regardless of what content is scrolled inside the field.
      const top = Math.min(
        fieldRect.bottom - btnSize - margin,
        window.innerHeight - btnSize - margin,
      );
      const left = Math.min(
        fieldRect.right - btnSize - margin,
        window.innerWidth - btnSize - margin,
      );
      button.style.top = `${Math.max(fieldRect.top + margin, top)}px`;
      button.style.left = `${Math.max(fieldRect.left + margin, left)}px`;
    } else {
      // Centered vertically, right-aligned for single-line inputs
      const top = fieldRect.top + (fieldRect.height - btnSize) / 2;
      const left = fieldRect.right - btnSize - margin;
      button.style.top = `${Math.max(0, top)}px`;
      button.style.left = `${Math.max(0, left)}px`;
    }
  };

  // Set initial position
  updateButtonPosition();

  // Note: Button starts hidden (opacity: 0, transform: scale(0.8))
  // It will be shown by setupFieldInteraction() in content_script_v2.ts
  // based on hover/focus settings

  // Hover effect - use filter instead of transform to avoid conflicting with show/hide scale
  button.addEventListener("mouseenter", () => {
    button.style.filter = "brightness(1.15)";
    button.style.boxShadow = "0 4px 8px rgba(102, 126, 234, 0.6)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.filter = "";
    button.style.boxShadow = "0 2px 4px rgba(102, 126, 234, 0.4)";
  });

  // Click handler
  let isClicking = false;
  button.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    isClicking = true;
    button.style.filter = "brightness(0.9)";
  });

  button.addEventListener("mouseup", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isClicking) {
      onClick(field);
    }
    isClicking = false;
    button.style.filter = "";
  });

  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  // Add to document body (since we're using fixed positioning)
  document.body.appendChild(button);

  // Observe field size changes
  const resizeObserver = new ResizeObserver(updateButtonPosition);
  resizeObserver.observe(field);

  // Update on scroll within the field itself (content inside textarea scrolling)
  field.addEventListener("scroll", updateButtonPosition, { passive: true });

  // Window scroll/resize: debounced to avoid excessive calls during page scroll
  let scrollTimeout: number;
  const windowScrollHandler = () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(updateButtonPosition, 10);
  };
  window.addEventListener("scroll", windowScrollHandler, { passive: true, capture: true });
  window.addEventListener("resize", windowScrollHandler, { passive: true });

  // Parent container scroll: call directly (no debounce) so the button
  // tracks the field edge in real-time when a scrollable ancestor is scrolled.
  let currentElement: HTMLElement | null = field.parentElement;
  const scrollHandlers: Array<{ element: HTMLElement; handler: () => void }> = [];
  while (currentElement) {
    const computedStyle = window.getComputedStyle(currentElement);
    const isScrollable =
      computedStyle.overflow === "auto" ||
      computedStyle.overflow === "scroll" ||
      computedStyle.overflowY === "auto" ||
      computedStyle.overflowY === "scroll" ||
      computedStyle.overflowX === "auto" ||
      computedStyle.overflowX === "scroll";

    if (isScrollable) {
      // Use direct call (no debounce) for snappy tracking of scrollable containers
      currentElement.addEventListener("scroll", updateButtonPosition, { passive: true });
      scrollHandlers.push({ element: currentElement, handler: updateButtonPosition });
    }
    currentElement = currentElement.parentElement;
  }

  // Cleanup function
  const cleanup = () => {
    button.remove();
    resizeObserver.disconnect();
    field.removeEventListener("scroll", updateButtonPosition);
    window.removeEventListener("scroll", windowScrollHandler, { capture: true });
    window.removeEventListener("resize", windowScrollHandler);
    scrollHandlers.forEach(({ element, handler }) => {
      element.removeEventListener("scroll", handler);
    });
  };

  return {
    element: button,
    field,
    cleanup,
  };
}

/**
 * Show assistant button with animation
 */
export function showButton(button: AssistantButton) {
  button.element.style.opacity = "1";
  button.element.style.transform = "scale(1)";
  button.element.style.pointerEvents = "auto";
}

/**
 * Hide assistant button with animation
 */
export function hideButton(button: AssistantButton) {
  button.element.style.opacity = "0";
  button.element.style.transform = "scale(0.8)";
  button.element.style.pointerEvents = "none";
}

/**
 * Remove assistant button
 */
export function removeButton(button: AssistantButton) {
  button.cleanup();
}
