import type { FieldRef, LLMChange } from "../shared/types";
import { resolveField } from "./field-resolver";

// Track if animation styles have been injected
let animationStylesInjected = false;

/**
 * Inject CSS keyframes for fill animation
 */
function injectAnimationStyles() {
  if (animationStylesInjected) return;

  const style = document.createElement("style");
  style.id = "sireno-fill-animation";
  style.textContent = `
    @keyframes sireno-fill-pulse {
      0% {
        background-color: rgba(102, 126, 234, 0.1);
        transform: scale(1);
      }
      50% {
        background-color: rgba(102, 126, 234, 0.3);
        transform: scale(1.02);
      }
      100% {
        background-color: rgba(102, 126, 234, 0);
        transform: scale(1);
      }
    }
    
    .sireno-filling {
      animation: sireno-fill-pulse 0.8s ease-out;
      transition: transform 0.8s ease-out;
    }
  `;
  document.head.appendChild(style);
  animationStylesInjected = true;
}

/**
 * Apply changes to fields
 */
export function applyChanges(
  changes: LLMChange[],
  fields: FieldRef[],
): { success: number; failed: number; errors: string[] } {
  // Inject animation styles
  injectAnimationStyles();

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const change of changes) {
    if (change.action === "skip") continue;

    try {
      const field = fields[change.fieldIndex];
      if (!field) {
        throw new Error(`Field index ${change.fieldIndex} not found`);
      }

      const element = resolveField(field.id, fields);
      if (!element) {
        throw new Error(`Could not resolve field: ${field.labelHint}`);
      }

      applyChangeToElement(element, change, field);
      success++;
    } catch (error) {
      failed++;
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return { success, failed, errors };
}

function applyChangeToElement(element: HTMLElement, change: LLMChange, field: FieldRef) {
  // Handle file inputs specially
  if (field.kind === "input" && field.inputType === "file") {
    // We can't programmatically set files, but we can trigger the picker
    if (change.action === "replace") {
      (element as HTMLInputElement).click();
    }
    return;
  }

  // Get current value
  let currentValue = "";
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    currentValue = element.value;
  } else if (element.hasAttribute("contenteditable")) {
    currentValue = element.textContent || "";
  }

  // Compute new value based on action
  let newValue = currentValue;
  switch (change.action) {
    case "replace":
      newValue = change.value;
      break;
    case "append":
      newValue = currentValue + change.value;
      break;
    case "clear":
      newValue = "";
      break;
  }

  // Store original background for restoration
  const originalBackground = element.style.background;
  const originalTransform = element.style.transform;
  const originalTransition = element.style.transition;

  // Set the new value
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    // Use native setter to support React/Vue
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    )?.set;

    if (element instanceof HTMLInputElement && nativeInputValueSetter) {
      nativeInputValueSetter.call(element, newValue);
    } else if (element instanceof HTMLTextAreaElement && nativeTextAreaValueSetter) {
      nativeTextAreaValueSetter.call(element, newValue);
    } else {
      element.value = newValue;
    }

    // Dispatch events
    element.dispatchEvent(new Event("input", { bubbles: true }));
    element.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (element.hasAttribute("contenteditable")) {
    element.textContent = newValue;
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }

  // Apply fill animation
  element.classList.add("sireno-filling");

  // Scroll field into view if not visible
  const rect = element.getBoundingClientRect();
  const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
  if (!isVisible) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Remove animation class after animation completes
  setTimeout(() => {
    element.classList.remove("sireno-filling");
    // Restore original styles
    element.style.background = originalBackground;
    element.style.transform = originalTransform;
    element.style.transition = originalTransition;
  }, 800);

  // Optional blur to trigger validation
  element.dispatchEvent(new Event("blur", { bubbles: true }));
}
