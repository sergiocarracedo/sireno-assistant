/**
 * Field resolution utilities
 * Standalone utility for resolving field references to DOM elements
 */

import type { FieldRef } from "../shared/types";

/**
 * Resolve a field by ID
 * Takes a field ID and list of field references and returns the DOM element
 */
export function resolveField(fieldId: string, fields: FieldRef[]): HTMLElement | null {
  const field = fields.find((f) => f.id === fieldId);
  if (!field) return null;

  // Try selector
  const element = document.querySelector<HTMLElement>(field.selector);
  if (element) return element;

  // Fallback: search by ID components
  if (fieldId.startsWith("id-")) {
    return document.getElementById(fieldId.substring(3));
  }
  if (fieldId.startsWith("name-")) {
    return document.querySelector(`[name="${fieldId.substring(5)}"]`);
  }
  if (fieldId.startsWith("testid-")) {
    return document.querySelector(`[data-testid="${fieldId.substring(7)}"]`);
  }

  return null;
}
