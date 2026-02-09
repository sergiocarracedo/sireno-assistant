/**
 * Example: How to use i18n in React components
 * 
 * This file demonstrates the i18n system usage
 * Copy these patterns when updating UI components
 */

import React from 'react'
import { t, useTranslation, getCurrentLanguage, setLanguage } from '../shared/i18n'

/**
 * Example 1: Using the t() function directly
 * Best for simple components or non-React code
 */
export function SimpleExample() {
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <button>{t('common.save')}</button>
      <button>{t('common.cancel')}</button>
    </div>
  )
}

/**
 * Example 2: Using the useTranslation hook
 * Best for components that need to react to language changes
 */
export function HookExample() {
  const { t, language, setLanguage } = useTranslation()
  
  return (
    <div>
      <h1>{t('settings.title')}</h1>
      <p>Current language: {language}</p>
      
      <select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
      
      <button>{t('common.save')}</button>
    </div>
  )
}

/**
 * Example 3: Using t() with nested keys
 * Supports dot notation for nested objects
 */
export function NestedKeysExample() {
  return (
    <div>
      <h2>{t('fields.title')}</h2>
      <p>{t('fields.detected')}</p>
      <p>{t('fields.contextLevels.domain')}</p>
      <p>{t('fields.contextLevels.url')}</p>
    </div>
  )
}

/**
 * Example 4: Using t() with parameters/interpolation
 * Use {{variable}} in translation strings
 */
export function InterpolationExample() {
  const skillCount = 5
  const username = 'John'
  
  return (
    <div>
      {/* In your translation file, use: "You have {{count}} skills" */}
      <p>{t('skills.count', { count: skillCount })}</p>
      
      {/* In your translation file, use: "Hello {{name}}!" */}
      <p>{t('common.greeting', { name: username })}</p>
    </div>
  )
}

/**
 * Example 5: Programmatic language detection and setting
 */
export function LanguageDetectionExample() {
  const currentLang = getCurrentLanguage()
  
  const switchToSpanish = () => {
    setLanguage('es')
  }
  
  const switchToEnglish = () => {
    setLanguage('en')
  }
  
  return (
    <div>
      <p>Current language: {currentLang}</p>
      <button onClick={switchToEnglish}>English</button>
      <button onClick={switchToSpanish}>Español</button>
    </div>
  )
}

/**
 * Example 6: Using translations in forms
 */
export function FormExample() {
  return (
    <form>
      <label htmlFor="name">{t('settings.apiKey')}</label>
      <input
        id="name"
        type="text"
        placeholder={t('settings.apiKeyPlaceholder')}
      />
      
      <label htmlFor="temp">{t('settings.temperature')}</label>
      <input id="temp" type="number" />
      <small>{t('settings.temperatureHelp')}</small>
      
      <button type="submit">{t('common.save')}</button>
      <button type="button">{t('common.cancel')}</button>
    </form>
  )
}

/**
 * Example 7: Using translations in error messages
 */
export function ErrorExample() {
  const [error, setError] = React.useState<string | null>(null)
  
  const handleSubmit = async () => {
    try {
      // Your API call here
      throw new Error('API key is invalid')
    } catch (err) {
      setError(t('errors.apiKeyInvalid'))
    }
  }
  
  return (
    <div>
      {error && (
        <div className="error">
          {error}
        </div>
      )}
      <button onClick={handleSubmit}>{t('common.submit')}</button>
    </div>
  )
}

/**
 * Quick Reference for Common Translation Keys:
 * 
 * Common actions:
 * - t('common.save')
 * - t('common.cancel')
 * - t('common.delete')
 * - t('common.edit')
 * - t('common.close')
 * 
 * Tab names:
 * - t('tabs.chat')
 * - t('tabs.fields')
 * - t('tabs.skills')
 * - t('tabs.settings')
 * - t('tabs.logs')
 * 
 * Chat:
 * - t('chat.placeholder')
 * - t('chat.send')
 * - t('chat.processing')
 * 
 * Errors:
 * - t('errors.apiKeyRequired')
 * - t('errors.requestFailed')
 * - t('errors.networkError')
 * 
 * See src/shared/translations/en.json for all available keys
 */
