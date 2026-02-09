/**
 * Internationalization (i18n) utilities
 * Supports multiple languages with fallback to English
 */

import enTranslations from './translations/en.json'
import esTranslations from './translations/es.json'
import { createLogger } from './logger'
import { useState, useEffect } from 'react'

const logger = createLogger('i18n')

export type SupportedLanguage = 'en' | 'es'
export type TranslationKey = string

interface Translations {
  [key: string]: any
}

const translations: Record<SupportedLanguage, Translations> = {
  en: enTranslations,
  es: esTranslations,
}

let currentLanguage: SupportedLanguage = 'en'
let languageChangeCallbacks: Array<(lang: SupportedLanguage) => void> = []

/**
 * Load saved language preference from storage
 */
async function loadSavedLanguage(): Promise<SupportedLanguage | null> {
  try {
    const result = await chrome.storage.local.get('language')
    if (result.language && isSupportedLanguage(result.language)) {
      return result.language as SupportedLanguage
    }
  } catch (error) {
    logger.error('Failed to load saved language:', error)
  }
  return null
}

/**
 * Save language preference to storage
 */
async function saveLanguage(lang: SupportedLanguage): Promise<void> {
  try {
    await chrome.storage.local.set({ language: lang })
    logger.debug('Language saved to storage:', lang)
  } catch (error) {
    logger.error('Failed to save language:', error)
  }
}

/**
 * Initialize i18n system with saved or browser's default language
 */
export async function initI18n(): Promise<void> {
  try {
    // Try to load saved language first
    const savedLanguage = await loadSavedLanguage()
    if (savedLanguage) {
      currentLanguage = savedLanguage
      logger.info('i18n initialized with saved language:', currentLanguage)
    } else {
      // Fall back to browser language
      const detectedLanguage = detectBrowserLanguage()
      currentLanguage = detectedLanguage
      logger.info('i18n initialized with browser language:', currentLanguage)
    }
  } catch (error) {
    logger.error('Failed to initialize i18n:', error)
    // Fallback to English on error
    currentLanguage = 'en'
  }
}

/**
 * Detect browser's default language
 * @returns Detected language code (en, es, etc.)
 */
export function detectBrowserLanguage(): SupportedLanguage {
  // Get browser language (e.g., "en-US", "es-ES", "es", etc.)
  const browserLang = navigator.language || (navigator as any).userLanguage || 'en'
  
  // Extract base language code (e.g., "en" from "en-US")
  const baseLanguage = browserLang.split('-')[0].toLowerCase()
  
  // Check if we support this language
  if (isSupportedLanguage(baseLanguage)) {
    return baseLanguage as SupportedLanguage
  }
  
  // Fallback to English
  logger.debug(`Browser language "${browserLang}" not supported, falling back to English`)
  return 'en'
}

/**
 * Get browser language in full format (e.g., "en-US", "es-ES")
 */
export function getBrowserLanguage(): string {
  return navigator.language || (navigator as any).userLanguage || 'en-US'
}

/**
 * Check if a language is supported
 */
function isSupportedLanguage(lang: string): boolean {
  return lang in translations
}

/**
 * Set current language and save to storage
 * @param lang Language code
 */
export async function setLanguage(lang: SupportedLanguage): Promise<void> {
  if (isSupportedLanguage(lang)) {
    currentLanguage = lang
    await saveLanguage(lang)
    logger.debug('Language set to:', currentLanguage)
    // Notify subscribers
    languageChangeCallbacks.forEach(callback => callback(lang))
  } else {
    logger.warn(`Language "${lang}" not supported, using English`)
    currentLanguage = 'en'
  }
}

/**
 * Get current language
 */
export function getCurrentLanguage(): SupportedLanguage {
  return currentLanguage
}

/**
 * Subscribe to language change events
 * @param callback Function to call when language changes
 * @returns Unsubscribe function
 */
export function onLanguageChange(callback: (lang: SupportedLanguage) => void): () => void {
  languageChangeCallbacks.push(callback)
  // Return unsubscribe function
  return () => {
    languageChangeCallbacks = languageChangeCallbacks.filter(cb => cb !== callback)
  }
}

/**
 * Get list of available languages
 */
export function getAvailableLanguages(): Array<{ code: SupportedLanguage; name: string }> {
  return [
    { code: 'en', name: t('languages.en') },
    { code: 'es', name: t('languages.es') },
  ]
}

/**
 * Get translation for a key
 * Supports nested keys using dot notation (e.g., "common.save")
 * Supports variable interpolation (e.g., "Hello {{name}}")
 * 
 * @param key Translation key (dot notation for nested keys)
 * @param params Optional parameters for interpolation
 * @returns Translated string
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  // Split key into parts for nested access
  const keys = key.split('.')
  
  // Try to get translation from current language
  let value: any = translations[currentLanguage]
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // Not found, try fallback (English)
      logger.debug(`Translation key "${key}" not found in "${currentLanguage}", using fallback`)
      value = translations['en']
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          // Not found in fallback either
          logger.warn(`Translation key "${key}" not found in any language`)
          return key
        }
      }
      break
    }
  }
  
  // If value is not a string, return the key
  if (typeof value !== 'string') {
    logger.warn(`Translation key "${key}" does not resolve to a string`)
    return key
  }
  
  // Interpolate parameters if provided
  if (params) {
    return interpolate(value, params)
  }
  
  return value
}

/**
 * Interpolate parameters into a string
 * Replaces {{key}} with corresponding value from params
 * 
 * @param str String with placeholders
 * @param params Parameters to interpolate
 * @returns Interpolated string
 */
function interpolate(str: string, params: Record<string, string | number>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key in params) {
      return String(params[key])
    }
    return match
  })
}

/**
 * Get current date and time formatted according to browser locale
 * @returns Formatted date and time string
 */
export function getCurrentDateTime(): string {
  const now = new Date()
  const locale = getBrowserLanguage()
  
  // Format: "January 15, 2024, 3:45 PM" (en) or "15 de enero de 2024, 15:45" (es)
  return now.toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get formatted date only
 * @returns Formatted date string
 */
export function getCurrentDate(): string {
  const now = new Date()
  const locale = getBrowserLanguage()
  
  return now.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Get formatted time only
 * @returns Formatted time string
 */
export function getCurrentTime(): string {
  const now = new Date()
  const locale = getBrowserLanguage()
  
  return now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * React hook for translations (for use in React components)
 * Returns t function and current language
 */
export function useTranslation() {
  const [lang, setLang] = useState(currentLanguage)
  
  useEffect(() => {
    const unsubscribe = onLanguageChange((newLang) => {
      setLang(newLang)
    })
    return unsubscribe
  }, [])
  
  return {
    t,
    language: lang,
    setLanguage: async (newLang: SupportedLanguage) => {
      await setLanguage(newLang)
    },
  }
}

// Auto-initialize on import (async)
initI18n().catch((error) => {
  // Silently fallback to English if initialization fails
  logger.error('Initialization failed, falling back to English:', error)
  currentLanguage = 'en'
})
