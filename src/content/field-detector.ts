/**
 * Advanced field detection system using multiple strategies
 */

import type { FieldRef } from '../shared/types'

// Simple inline logger for content script (avoid import issues)
const IS_DEV = import.meta.env.DEV
const logger = {
  debug: (...args: any[]) => IS_DEV && console.log('[field-detector]', ...args),
  info: (...args: any[]) => console.info('[field-detector]', ...args),
  warn: (...args: any[]) => console.warn('[field-detector]', ...args),
  error: (...args: any[]) => console.error('[field-detector]', ...args),
}

export interface DetectedField {
  element: HTMLElement
  fieldRef: FieldRef
  wrapper: HTMLElement | null
}

/**
 * Check if an element is an editable field
 * Handles inputs, textareas, contenteditable, and ARIA textboxes
 */
export function isEditableField(element: Element, skipProcessedCheck = false): boolean {
  if (!(element instanceof HTMLElement)) return false

  // Skip if already processed (unless explicitly told not to check)
  if (!skipProcessedCheck && element.hasAttribute('data-sireno-processed')) return false

  // Check standard inputs (exclude password, hidden, file)
  if (
    element.matches(
      'input:not([type="password"]):not([type="file"]):not([type="hidden"]):not([disabled]):not([readonly])',
    )
  ) {
    return true
  }

  // Check textarea
  if (element.matches('textarea:not([disabled]):not([readonly])')) {
    return true
  }

  // Check contenteditable (handles all variants)
  const contenteditable = element.getAttribute('contenteditable')
  if (
    contenteditable === 'true' ||
    contenteditable === '' ||
    contenteditable === 'plaintext-only'
  ) {
    return true
  }

  // Check ARIA role="textbox"
  if (
    element.getAttribute('role') === 'textbox' &&
    element.getAttribute('aria-disabled') !== 'true'
  ) {
    return true
  }

  // Check if element is inside a contenteditable parent
  const editableParent = element.closest(
    '[contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"]',
  )
  if (editableParent && editableParent !== element) {
    // Don't treat children of contenteditable as separate fields
    return false
  }

  return false
}

/**
 * Find or create a positioned wrapper for the field
 * This allows us to use absolute positioning relative to the field
 */
export function getFieldWrapper(field: HTMLElement): HTMLElement {
  // Check if field already has a positioned ancestor
  let current = field.parentElement
  while (current && current !== document.body) {
    const position = window.getComputedStyle(current).position
    if (position !== 'static') {
      return current
    }
    current = current.parentElement
  }

  // If no positioned ancestor, check if parent can be made relative
  const parent = field.parentElement
  if (parent && parent !== document.body) {
    const originalPosition = window.getComputedStyle(parent).position
    if (originalPosition === 'static') {
      // Make parent relative so we can position absolutely within it
      parent.style.position = 'relative'
      parent.setAttribute('data-sireno-wrapper', 'true')
      return parent
    }
    return parent
  }

  // Fallback: use the field itself
  return field
}

/**
 * Extract field reference information
 */
export function createFieldRef(element: HTMLElement, index: number): FieldRef {
  const inputType =
    element instanceof HTMLInputElement ? element.type : undefined
  const kind =
    element instanceof HTMLInputElement
      ? 'input'
      : element instanceof HTMLTextAreaElement
        ? 'textarea'
        : 'contenteditable'

  return {
    id: generateFieldId(element, index),
    frameId: 0,
    selector: generateSelector(element),
    kind,
    inputType,
    labelHint: extractLabelHint(element),
    value: extractValue(element),
  }
}

function generateFieldId(element: HTMLElement, fallbackIndex: number): string {
  if (element.id) return `id-${element.id}`
  if (element.getAttribute('name'))
    return `name-${element.getAttribute('name')}`
  if (element.getAttribute('data-testid'))
    return `testid-${element.getAttribute('data-testid')}`
  if (element.getAttribute('aria-label'))
    return `aria-${element.getAttribute('aria-label')?.replace(/\s+/g, '-')}`
  return `index-${fallbackIndex}`
}

function generateSelector(element: HTMLElement): string {
  if (element.id) return `#${element.id}`
  const name = element.getAttribute('name')
  if (name) return `[name="${name}"]`
  const testId = element.getAttribute('data-testid')
  if (testId) return `[data-testid="${testId}"]`

  const tag = element.tagName.toLowerCase()
  const parent = element.parentElement
  if (parent) {
    const siblings = Array.from(parent.children).filter(
      (el) => el.tagName === element.tagName,
    )
    const index = siblings.indexOf(element) + 1
    return `${tag}:nth-of-type(${index})`
  }
  return tag
}

function extractLabelHint(element: HTMLElement): string {
  // Try label element
  if (element.id) {
    const label = document.querySelector<HTMLLabelElement>(
      `label[for="${element.id}"]`,
    )
    if (label?.textContent) return label.textContent.trim()
  }

  // Try aria-label
  const ariaLabel = element.getAttribute('aria-label')
  if (ariaLabel) return ariaLabel

  // Try aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby')
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy)
    if (labelElement?.textContent) return labelElement.textContent.trim()
  }

  // Try placeholder
  const placeholder = element.getAttribute('placeholder')
  if (placeholder) return placeholder

  // Try name
  const name = element.getAttribute('name')
  if (name) return name

  // Try parent label
  const parentLabel = element.closest('label')
  if (parentLabel?.textContent) {
    return parentLabel.textContent.replace(element.textContent || '', '').trim()
  }

  // Try data-testid
  const testId = element.getAttribute('data-testid')
  if (testId) return testId

  return `${element.tagName.toLowerCase()}`
}

function extractValue(element: HTMLElement): string {
  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    return element.value
  }
  if (element.getAttribute('contenteditable') !== 'false') {
    return element.textContent || ''
  }
  if (element.getAttribute('role') === 'textbox') {
    return element.textContent || ''
  }
  return ''
}

/**
 * Recursively traverse Shadow DOM to find editable fields
 */
function traverseShadowDOM(
  root: Document | ShadowRoot | Element,
  callback: (element: HTMLElement) => void,
  selectors: string[],
) {
  // Query fields in current root
  const fields = root.querySelectorAll<HTMLElement>(selectors.join(', '))
  fields.forEach(callback)

  // Find all elements with shadow roots and traverse them
  const allElements = root.querySelectorAll('*')
  allElements.forEach((element) => {
    if (element.shadowRoot) {
      logger.debug('[FieldDetector] Found Shadow DOM:', element)
      traverseShadowDOM(element.shadowRoot, callback, selectors)
    }
  })
}

/**
 * Multi-strategy field detector
 * Combines mutation observer, focus tracking, polling, intersection observer, and Shadow DOM support
 */
export class FieldDetector {
  private knownFields = new Map<HTMLElement, DetectedField>()
  private mutationObserver: MutationObserver | null = null
  private intersectionObserver: IntersectionObserver | null = null
  private pollingInterval: number | null = null
  private onFieldDetected: ((field: DetectedField) => void) | null = null
  private onFieldRemoved: ((element: HTMLElement) => void) | null = null
  private shadowRootObservers = new Map<ShadowRoot, MutationObserver>()

  constructor() {
    logger.debug('[FieldDetector] Initializing multi-strategy detector with Shadow DOM support')
  }

  /**
   * Start all detection strategies
   */
  start(
    onFieldDetected: (field: DetectedField) => void,
    onFieldRemoved: (element: HTMLElement) => void,
  ) {
    this.onFieldDetected = onFieldDetected
    this.onFieldRemoved = onFieldRemoved

    // Strategy 1: Initial discovery (including Shadow DOM)
    this.discoverExistingFields()

    // Set up observers for existing shadow roots
    this.observeExistingShadowRoots()

    // Strategy 2: Focus tracking (capture phase)
    this.setupFocusTracking()

    // Strategy 3: Mutation observer (including Shadow DOM detection)
    this.setupMutationObserver()

    // Strategy 4: Intersection observer
    this.setupIntersectionObserver()

    // Strategy 5: Polling fallback (including Shadow DOM)
    this.startPolling()

    logger.debug('[FieldDetector] All detection strategies started (with Shadow DOM support)')
  }

  /**
   * Observe all existing Shadow Roots in the document
   */
  private observeExistingShadowRoots() {
    const allElements = document.querySelectorAll('*')
    allElements.forEach((element) => {
      if (element.shadowRoot) {
        logger.debug('[FieldDetector] Found existing Shadow Root on:', element)
        this.observeShadowRoot(element.shadowRoot)
      }
    })
  }

  /**
   * Scan a Shadow Root for editable fields
   */
  private scanShadowRoot(shadowRoot: ShadowRoot) {
    const selectors = [
      'input:not([type="password"]):not([type="file"]):not([type="hidden"]):not([disabled]):not([readonly])',
      'textarea:not([disabled]):not([readonly])',
      '[contenteditable="true"]',
      '[contenteditable=""]',
      '[contenteditable="plaintext-only"]',
      '[role="textbox"]:not([aria-disabled="true"])',
    ]
    
    const fields = shadowRoot.querySelectorAll<HTMLElement>(selectors.join(', '))
    logger.debug('[FieldDetector] Scanning Shadow Root, found', fields.length, 'fields')
    
    fields.forEach((field) => {
      if (isEditableField(field)) {
        this.registerField(field, this.knownFields.size)
      }
    })
    
    // Recursively check for nested shadow roots
    const elementsWithShadow = shadowRoot.querySelectorAll('*')
    elementsWithShadow.forEach((el) => {
      if (el.shadowRoot) {
        this.observeShadowRoot(el.shadowRoot)
        this.scanShadowRoot(el.shadowRoot)
      }
    })
  }

  /**
   * Set up mutation observer for a Shadow Root
   */
  private observeShadowRoot(shadowRoot: ShadowRoot) {
    // Don't observe the same shadow root twice
    if (this.shadowRootObservers.has(shadowRoot)) {
      return
    }

    const observer = new MutationObserver((mutations) => {
      let hasChanges = false

      mutations.forEach((mutation) => {
        // Check added nodes in shadow DOM
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (isEditableField(node)) {
              hasChanges = true
              logger.debug('[FieldDetector] Shadow DOM mutation: new field', node)
              this.registerField(node, this.knownFields.size)
            }

            const descendants = node.querySelectorAll<HTMLElement>(
              'input, textarea, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], [role="textbox"]',
            )
            descendants.forEach((desc) => {
              if (isEditableField(desc)) {
                hasChanges = true
                logger.debug('[FieldDetector] Shadow DOM mutation: new descendant', desc)
                this.registerField(desc, this.knownFields.size)
              }
            })

            // Check for nested shadow roots
            if (node.shadowRoot) {
              this.observeShadowRoot(node.shadowRoot)
              this.scanShadowRoot(node.shadowRoot)
            }
          }
        })

        // Check removed nodes
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (this.knownFields.has(node)) {
              this.unregisterField(node)
            }
            this.knownFields.forEach((_, field) => {
              if (node.contains(field)) {
                this.unregisterField(field)
              }
            })
          }
        })

        // Check attribute changes
        if (
          mutation.type === 'attributes' &&
          mutation.target instanceof HTMLElement
        ) {
          const target = mutation.target
          const attributeName = mutation.attributeName

          if (attributeName === 'contenteditable') {
            const isNowEditable = isEditableField(target, true)
            const wasKnown = this.knownFields.has(target)

            if (isNowEditable && !wasKnown) {
              hasChanges = true
              logger.debug('[FieldDetector] Shadow DOM: element became contenteditable:', target)
              this.registerField(target, this.knownFields.size)
            } else if (!isNowEditable && wasKnown) {
              logger.debug('[FieldDetector] Shadow DOM: element no longer contenteditable:', target)
              this.unregisterField(target)
            }
          } else {
            if (isEditableField(target) && !this.knownFields.has(target)) {
              hasChanges = true
              this.registerField(target, this.knownFields.size)
            } else if (!isEditableField(target, true) && this.knownFields.has(target)) {
              this.unregisterField(target)
            }
          }
        }
      })

      if (hasChanges) {
        logger.debug(
          '[FieldDetector] Shadow DOM mutation detected changes, total fields:',
          this.knownFields.size,
        )
      }
    })

    observer.observe(shadowRoot, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'contenteditable',
        'disabled',
        'readonly',
        'role',
        'aria-disabled',
      ],
    })

    this.shadowRootObservers.set(shadowRoot, observer)
    logger.debug('[FieldDetector] Shadow Root observer started')
  }

  /**
   * Stop all detection strategies
   */
  stop() {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect()
      this.mutationObserver = null
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }

    // Disconnect all shadow root observers
    this.shadowRootObservers.forEach((observer) => {
      observer.disconnect()
    })
    this.shadowRootObservers.clear()

    document.removeEventListener('focusin', this.handleFocusIn, {
      capture: true,
    } as any)

    this.knownFields.clear()
    logger.debug('[FieldDetector] All detection strategies stopped (including Shadow DOM)')
  }

  /**
   * Strategy 1: Discover existing fields on page load (including Shadow DOM)
   */
  private discoverExistingFields() {
    const selectors = [
      'input:not([type="password"]):not([type="file"]):not([type="hidden"]):not([disabled]):not([readonly])',
      'textarea:not([disabled]):not([readonly])',
      '[contenteditable="true"]',
      '[contenteditable=""]',
      '[contenteditable="plaintext-only"]',
      '[role="textbox"]:not([aria-disabled="true"])',
    ]

    let fieldCount = 0
    
    // Traverse main document and all Shadow DOMs
    traverseShadowDOM(
      document,
      (field) => {
        this.registerField(field, fieldCount)
        fieldCount++
      },
      selectors,
    )

    logger.debug(
      '[FieldDetector] Initial discovery found',
      fieldCount,
      'fields (including Shadow DOM)',
    )
  }

  /**
   * Strategy 2: Track focus events at document level (capture phase)
   * This catches focus even when page uses stopPropagation
   */
  private setupFocusTracking() {
    document.addEventListener('focusin', this.handleFocusIn.bind(this), {
      capture: true,
      passive: true,
    })
    logger.debug('[FieldDetector] Focus tracking enabled (capture phase)')
  }

  private handleFocusIn = (event: FocusEvent) => {
    const target = event.target
    if (target instanceof HTMLElement && isEditableField(target)) {
      if (!this.knownFields.has(target)) {
        logger.debug('[FieldDetector] Focus detected new field:', target)
        this.registerField(target, this.knownFields.size)
      }
    }
  }

  /**
   * Strategy 3: Mutation observer for DOM changes (including Shadow DOM)
   */
  private setupMutationObserver() {
    this.mutationObserver = new MutationObserver((mutations) => {
      let hasChanges = false

      mutations.forEach((mutation) => {
        // Check added nodes
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (isEditableField(node)) {
              hasChanges = true
              logger.debug('[FieldDetector] Mutation: new editable field added', node)
              this.registerField(node, this.knownFields.size)
            }
            
            // Check if this element has a shadow root
            if (node.shadowRoot) {
              logger.debug('[FieldDetector] Mutation: element with Shadow DOM added', node)
              this.observeShadowRoot(node.shadowRoot)
              this.scanShadowRoot(node.shadowRoot)
              hasChanges = true
            }
            
            // Check descendants with proper selectors (in light DOM)
            const descendants = node.querySelectorAll<HTMLElement>(
              'input, textarea, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], [role="textbox"]',
            )
            descendants.forEach((desc) => {
              if (isEditableField(desc)) {
                hasChanges = true
                logger.debug('[FieldDetector] Mutation: new editable descendant found', desc)
                this.registerField(desc, this.knownFields.size)
              }
            })
            
            // Check for shadow roots in descendants
            const elementsWithShadow = node.querySelectorAll('*')
            elementsWithShadow.forEach((el) => {
              if (el.shadowRoot) {
                logger.debug('[FieldDetector] Mutation: descendant with Shadow DOM found', el)
                this.observeShadowRoot(el.shadowRoot)
                this.scanShadowRoot(el.shadowRoot)
                hasChanges = true
              }
            })
          }
        })

        // Check removed nodes
        mutation.removedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (this.knownFields.has(node)) {
              this.unregisterField(node)
            }
            // Check descendants
            this.knownFields.forEach((_, field) => {
              if (node.contains(field)) {
                this.unregisterField(field)
              }
            })
          }
        })

        // Check attribute changes (contenteditable, disabled, readonly)
        if (
          mutation.type === 'attributes' &&
          mutation.target instanceof HTMLElement
        ) {
          const target = mutation.target
          const attributeName = mutation.attributeName
          
          // For contenteditable changes, we need special handling
          if (attributeName === 'contenteditable') {
            const isNowEditable = isEditableField(target, true) // Skip processed check
            const wasKnown = this.knownFields.has(target)
            
            if (isNowEditable && !wasKnown) {
              // Element became editable - register it
              hasChanges = true
              logger.debug('[FieldDetector] Element became contenteditable:', target)
              this.registerField(target, this.knownFields.size)
            } else if (!isNowEditable && wasKnown) {
              // Element is no longer editable - unregister it
              logger.debug('[FieldDetector] Element no longer contenteditable:', target)
              this.unregisterField(target)
            }
          } else {
            // For other attributes, use normal check
            if (isEditableField(target) && !this.knownFields.has(target)) {
              hasChanges = true
              this.registerField(target, this.knownFields.size)
            } else if (!isEditableField(target, true) && this.knownFields.has(target)) {
              this.unregisterField(target)
            }
          }
        }
      })

      if (hasChanges) {
        logger.debug(
          '[FieldDetector] Mutation observer detected changes, total fields:',
          this.knownFields.size,
        )
      }
    })

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        'contenteditable',
        'disabled',
        'readonly',
        'role',
        'aria-disabled',
      ],
    })

    logger.debug('[FieldDetector] Mutation observer started')
  }

  /**
   * Strategy 4: Intersection observer for lazy-loaded content
   */
  private setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target instanceof HTMLElement) {
            if (
              isEditableField(entry.target) &&
              !this.knownFields.has(entry.target)
            ) {
              logger.debug(
                '[FieldDetector] Intersection observer detected visible field:',
                entry.target,
              )
              this.registerField(entry.target, this.knownFields.size)
            }
          }
        })
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      },
    )

    // Observe existing fields
    this.knownFields.forEach((_, field) => {
      this.intersectionObserver?.observe(field)
    })

    logger.debug('[FieldDetector] Intersection observer started')
  }

  /**
   * Strategy 5: Polling fallback (every 3 seconds)
   */
  private startPolling() {
    this.pollingInterval = window.setInterval(() => {
      this.discoverNewFields()
    }, 3000)

    logger.debug('[FieldDetector] Polling started (every 3s)')
  }

  private discoverNewFields() {
    const selectors = [
      'input:not([type="password"]):not([type="file"]):not([type="hidden"]):not([disabled]):not([readonly])',
      'textarea:not([disabled]):not([readonly])',
      '[contenteditable="true"]',
      '[contenteditable=""]',
      '[contenteditable="plaintext-only"]',
      '[role="textbox"]:not([aria-disabled="true"])',
    ]

    let newCount = 0

    // Traverse main document and all Shadow DOMs
    traverseShadowDOM(
      document,
      (field) => {
        // Use skipProcessedCheck for contenteditable to detect state changes
        const isContentEditable = field.hasAttribute('contenteditable')
        const shouldCheck = isContentEditable ? isEditableField(field, true) : isEditableField(field)

        if (!this.knownFields.has(field) && shouldCheck) {
          this.registerField(field, this.knownFields.size)
          newCount++
        }
      },
      selectors,
    )

    if (newCount > 0) {
      logger.debug('[FieldDetector] Polling discovered', newCount, 'new fields (including Shadow DOM)')
    }
  }

  /**
   * Register a new field
   */
  private registerField(element: HTMLElement, index: number) {
    if (this.knownFields.has(element)) return

    const fieldRef = createFieldRef(element, index)
    const wrapper = getFieldWrapper(element)

    const detectedField: DetectedField = {
      element,
      fieldRef,
      wrapper,
    }

    this.knownFields.set(element, detectedField)
    element.setAttribute('data-sireno-processed', 'true')

    // Start observing with intersection observer
    this.intersectionObserver?.observe(element)

    // Notify callback
    if (this.onFieldDetected) {
      this.onFieldDetected(detectedField)
    }
  }

  /**
   * Unregister a field
   */
  private unregisterField(element: HTMLElement) {
    if (!this.knownFields.has(element)) return

    this.knownFields.delete(element)
    element.removeAttribute('data-sireno-processed')

    // Stop observing
    this.intersectionObserver?.unobserve(element)

    // Notify callback
    if (this.onFieldRemoved) {
      this.onFieldRemoved(element)
    }
  }

  /**
   * Get all known fields
   */
  getFields(): DetectedField[] {
    return Array.from(this.knownFields.values())
  }

  /**
   * Get field by element
   */
  getField(element: HTMLElement): DetectedField | undefined {
    return this.knownFields.get(element)
  }
}
