/**
 * Content script -
 * Uses iframe isolation, capture-phase detection, and multi-strategy field discovery
 */

import type { FieldRef } from '../shared/types'
import {
  createAssistantButton,
  hideButton,
  removeButton,
  showButton,
  type AssistantButton,
} from './assistant-button'
import { extractContext } from './context-extractor'
import { applyChanges } from './field-applier'
import { FieldDetector, type DetectedField } from './field-detector'
import { closeInlineChat, openInlineChat } from './iframe-chat'

console.log('[Sireno] Content script initializing')

// Field detector instance
const fieldDetector = new FieldDetector()

// Track buttons for each field
const fieldButtons = new Map<HTMLElement, AssistantButton>()

// Track discovered fields for sidepanel
let discoveredFields: FieldRef[] = []

// Settings
let showButtonOnHover = true
let showButtonOnFocus = true

/**
 * Check if extension context is still valid
 */
function isExtensionContextValid(): boolean {
  try {
    return chrome.runtime?.id !== undefined
  } catch {
    return false
  }
}

/**
 * Safe wrapper for chrome.runtime.sendMessage
 */
async function safeSendMessage(message: any): Promise<any> {
  if (!isExtensionContextValid()) {
    console.warn('[Sireno] Extension context invalidated')
    return null
  }

  try {
    return await chrome.runtime.sendMessage(message)
  } catch (error: any) {
    if (error.message?.includes('Extension context invalidated')) {
      console.warn('[Sireno] Extension was reloaded')
      showReloadNotification()
      return null
    }
    throw error
  }
}

/**
 * Show reload notification
 */
function showReloadNotification() {
  const notification = document.createElement('div')
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  `
  notification.textContent = '✨ Sireno Assistant was updated. Click to reload.'
  notification.addEventListener('click', () => {
    window.location.reload()
  })

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.opacity = '0'
    setTimeout(() => notification.remove(), 300)
  }, 5000)
}

/**
 * Load config from storage
 */
async function loadConfig() {
  try {
    const response = await safeSendMessage({ type: 'GET_CONFIG' })
    if (response?.type === 'CONFIG_RESPONSE') {
      showButtonOnHover = response.config.showSparkOnHover !== false
      showButtonOnFocus = response.config.showSparkOnFocus !== false
      console.log('[Sireno] Config loaded:', {
        showButtonOnHover,
        showButtonOnFocus,
      })
    }
  } catch (error) {
    console.error('[Sireno] Failed to load config:', error)
  }
}

/**
 * Handle field detected
 */
async function handleFieldDetected(detectedField: DetectedField) {
  const { element, fieldRef, wrapper } = detectedField

  console.log('[Sireno] Field detected:', fieldRef.id, element)

  // Check if field is excluded
  try {
    const response = await safeSendMessage({
      type: 'IS_FIELD_EXCLUDED',
      url: window.location.href,
      fieldId: fieldRef.id,
    })

    if (response?.type === 'FIELD_EXCLUDED_RESPONSE' && response.isExcluded) {
      console.log('[Sireno] Field excluded, skipping button:', fieldRef.id)
      return // Don't create button
    }
  } catch (error) {
    console.error('[Sireno] Failed to check if field is excluded:', error)
    // Continue to create button on error
  }

  // Create button if not exists
  if (!fieldButtons.has(element)) {
    const button = createAssistantButton(
      element,
      wrapper || element,
      (field) => {
        console.log('[Sireno] Button clicked for field:', fieldRef.id)
        openInlineChat(fieldRef.id, field, fieldRef.labelHint)
      },
    )

    fieldButtons.set(element, button)

    // Setup hover and focus behavior
    setupFieldInteraction(element, button)
  }

  // Update discovered fields list
  updateDiscoveredFields()
}

/**
 * Handle field removed
 */
function handleFieldRemoved(element: HTMLElement) {
  console.log('[Sireno] Field removed:', element)

  const button = fieldButtons.get(element)
  if (button) {
    removeButton(button)
    fieldButtons.delete(element)
  }

  updateDiscoveredFields()
}

/**
 * Setup field interaction (hover, focus)
 */
function setupFieldInteraction(field: HTMLElement, button: AssistantButton) {
  // Initially hide button
  hideButton(button)

  // Hover behavior
  if (showButtonOnHover) {
    field.addEventListener('mouseenter', () => {
      showButton(button)
    })

    field.addEventListener('mouseleave', () => {
      // Only hide if not focused
      if (
        document.activeElement !== field &&
        !field.contains(document.activeElement) &&
        !field.matches(':focus')
      ) {
        hideButton(button)
      }
    })
  }

  // Focus behavior
  if (showButtonOnFocus) {
    field.addEventListener('focus', () => {
      showButton(button)
    })

    field.addEventListener('blur', () => {
      // Hide after a delay (allow button click)
      setTimeout(() => {
        // Only hide if not hovered
        if (!field.matches(':hover')) {
          hideButton(button)
        }
      }, 200)
    })
  }

  // For contenteditable, also listen to clicks
  if (
    field.getAttribute('contenteditable') !== 'false' &&
    field.getAttribute('contenteditable') !== null
  ) {
    field.addEventListener('click', () => {
      showButton(button)
    })
  }
}

/**
 * Update discovered fields for sidepanel
 */
function updateDiscoveredFields() {
  const fields = fieldDetector.getFields()
  discoveredFields = fields.map((f) => f.fieldRef)

  // Notify sidepanel
  safeSendMessage({
    type: 'FIELDS_DISCOVERED',
    fields: discoveredFields,
  }).catch(() => {
    // Ignore errors (sidepanel might not be open)
  })
}

/**
 * Initialize
 */
async function init() {
  console.log('[Sireno] Initializing...')

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise((resolve) => {
      document.addEventListener('DOMContentLoaded', resolve, { once: true })
    })
  }

  // Wait for body
  if (!document.body) {
    await new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        if (document.body) {
          observer.disconnect()
          resolve(undefined)
        }
      })
      observer.observe(document.documentElement, { childList: true })
    })
  }

  // Load config
  await loadConfig()

  // Start field detection
  fieldDetector.start(handleFieldDetected, handleFieldRemoved)

  console.log('[Sireno] Initialization complete')
}

/**
 * Listen for config updates
 */
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'CONFIG_UPDATED') {
    console.log('[Sireno] Config updated, reloading')
    loadConfig()
    sendResponse({ success: true })
    return false
  }

  if (message.type === 'SCAN_FIELDS') {
    console.log('[Sireno] Manual field scan requested')
    updateDiscoveredFields()
    sendResponse({ fields: discoveredFields })
    return false
  }

  if (message.type === 'APPLY_CHANGES') {
    console.log('[Sireno] Applying changes to fields')
    applyChanges(message.changes, discoveredFields)
    sendResponse({ success: true })
    return false
  }

  if (message.type === 'GET_CONTEXT' || message.type === 'EXTRACT_CONTEXT') {
    console.log('[Sireno] Context extraction requested')
    const context = extractContext(
      message.level,
      message.selectedFieldIds || [],
      discoveredFields,
      message.textLimit,
    )
    sendResponse({ context })
    return false
  }

  if (message.type === 'FIELD_UNEXCLUDED') {
    console.log('[Sireno] Field un-excluded, recreating button:', message.fieldId)
    
    // Find the field
    const fields = fieldDetector.getFields()
    const field = fields.find((f) => f.fieldRef.id === message.fieldId)
    
    if (field) {
      console.log('[Sireno] Found field, checking if button exists:', field.fieldRef.id)
      
      // Only create button if it doesn't already exist
      if (!fieldButtons.has(field.element)) {
        console.log('[Sireno] Creating button for un-excluded field:', field.fieldRef.id)
        const button = createAssistantButton(
          field.element,
          field.wrapper || field.element,
          (fieldElement) => {
            console.log('[Sireno] Button clicked for field:', field.fieldRef.id)
            openInlineChat(field.fieldRef.id, fieldElement, field.fieldRef.labelHint)
          },
        )
        
        fieldButtons.set(field.element, button)
        setupFieldInteraction(field.element, button)
        console.log('[Sireno] Button created for un-excluded field:', field.fieldRef.id)
      } else {
        console.log('[Sireno] Button already exists for field:', field.fieldRef.id)
      }
    } else {
      console.warn('[Sireno] Could not find field with ID:', message.fieldId)
    }
    
    sendResponse({ success: true })
    return false
  }

  if (message.type === 'FOCUS_FIELD') {
    console.log('[Sireno] Focus field requested:', message.fieldId)
    
    // Find the field
    const fields = fieldDetector.getFields()
    const field = fields.find((f) => f.fieldRef.id === message.fieldId)
    
    if (field) {
      // Scroll the field into view
      field.element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      
      // Focus the field
      field.element.focus()
      
      console.log('[Sireno] Field focused and scrolled into view:', message.fieldId)
      sendResponse({ success: true })
    } else {
      console.warn('[Sireno] Could not find field with ID:', message.fieldId)
      sendResponse({ success: false, error: 'Field not found' })
    }
    
    return false
  }

  if (message.type === 'HIGHLIGHT_FIELD') {
    console.log('[Sireno] Highlight field requested:', message.fieldId)
    
    // Find the field
    const fields = fieldDetector.getFields()
    const field = fields.find((f) => f.fieldRef.id === message.fieldId)
    
    if (field) {
      const duration = message.duration || 3000
      
      // Store original styles
      const originalOutline = field.element.style.outline
      const originalOutlineOffset = field.element.style.outlineOffset
      const originalTransition = field.element.style.transition
      
      // Apply highlight effect
      field.element.style.transition = 'outline 0.3s ease'
      field.element.style.outline = '3px solid #667eea'
      field.element.style.outlineOffset = '2px'
      
      // Remove highlight after duration
      setTimeout(() => {
        field.element.style.transition = 'outline 0.5s ease'
        field.element.style.outline = originalOutline
        field.element.style.outlineOffset = originalOutlineOffset
        
        // Restore original transition after fade-out completes
        setTimeout(() => {
          field.element.style.transition = originalTransition
        }, 500)
      }, duration)
      
      console.log('[Sireno] Field highlighted for', duration, 'ms:', message.fieldId)
      sendResponse({ success: true })
    } else {
      console.warn('[Sireno] Could not find field with ID:', message.fieldId)
      sendResponse({ success: false, error: 'Field not found' })
    }
    
    return false
  }

  return false
})

/**
 * Listen for field exclusion events from iframe-chat
 */
window.addEventListener('message', (event) => {
  console.log('[Sireno] Window message received:', event.data)
  
  if (event.data?.type === 'FIELD_EXCLUDED') {
    const excludedFieldId = event.data.fieldId
    console.log('[Sireno] Field excluded, removing button:', excludedFieldId)
    console.log('[Sireno] Current field buttons:', fieldButtons)
    console.log('[Sireno] Current detected fields:', fieldDetector.getFields())

    // Find and remove button for this field
    const fields = fieldDetector.getFields()
    const excludedField = fields.find((f) => f.fieldRef.id === excludedFieldId)
    
    console.log('[Sireno] Found excluded field:', excludedField)

    if (excludedField) {
      const button = fieldButtons.get(excludedField.element)
      console.log('[Sireno] Found button:', button)
      
      if (button) {
        removeButton(button)
        fieldButtons.delete(excludedField.element)
        console.log('[Sireno] Button removed for excluded field:', excludedFieldId)
      } else {
        console.warn('[Sireno] No button found for field element')
      }
    } else {
      console.warn('[Sireno] No field found with ID:', excludedFieldId)
    }
  }
})

// Start initialization
init().catch((error) => {
  console.error('[Sireno] Initialization failed:', error)
})

// Export for debugging
if (typeof window !== 'undefined') {
  ;(window as any).__SIRENO_DEBUG__ = {
    fieldDetector,
    fieldButtons,
    discoveredFields,
    closeInlineChat,
    isExtensionContextValid,
    getFields: () => fieldDetector.getFields(),
  }
}
