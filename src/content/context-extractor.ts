import type { ContextBundle, ContextLevel, FieldRef } from '../shared/types';

/**
 * Get current date and time formatted according to browser locale
 */
function getCurrentDateTime(): string {
  const now = new Date()
  const locale = navigator.language || 'en-US'
  
  return now.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get browser language in full format
 */
function getBrowserLanguage(): string {
  return navigator.language || 'en-US'
}

/**
 * Extract context based on the specified level
 */
export function extractContext(
  level: ContextLevel,
  selectedFieldIds: string[],
  allFields: FieldRef[],
  textLimit = 10000
): ContextBundle {
  const context: ContextBundle = { 
    level,
    // Always include date/time and language for all levels except 'none'
    dateTime: level !== 'none' ? getCurrentDateTime() : undefined,
    language: level !== 'none' ? getBrowserLanguage() : undefined,
  };
  
  if (level === 'none') {
    return context;
  }
  
  // Domain level and above
  if (level === 'domain' || level === 'url' || level === 'selected' || level === 'allPage') {
    context.domain = window.location.hostname;
  }
  
  // URL level and above
  if (level === 'url' || level === 'selected' || level === 'allPage') {
    context.url = window.location.href;
  }
  
  // Selected fields level and above
  if (level === 'selected' || level === 'allPage') {
    context.selectedFields = allFields.filter((f) => selectedFieldIds.includes(f.id));
  }
  
  // All page level
  if (level === 'allPage') {
    context.pageText = extractVisibleText(textLimit);
  }
  
  return context;
}

/**
 * Extract visible text from the page (capped)
 */
function extractVisibleText(limit: number): string {
  // Get body text, removing script and style elements
  const clone = document.body.cloneNode(true) as HTMLElement;
  
  // Remove scripts, styles, and hidden elements
  clone.querySelectorAll('script, style, [hidden]').forEach((el) => el.remove());
  
  // Get text content
  let text = clone.textContent || '';
  
  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  // Cap at limit
  if (text.length > limit) {
    text = text.substring(0, limit) + '...';
  }
  
  return text;
}
