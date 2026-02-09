/**
 * Design tokens for Sireno Assistant
 * Centralized color definitions to maintain consistency
 */

export const DesignTokens = {
  /**
   * Primary brand gradient (violet/purple)
   * Used for buttons, icons, and brand elements
   */
  gradient: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    primaryStart: '#667eea',
    primaryEnd: '#764ba2',
  },

  /**
   * Success gradient animation (for AI field updates)
   * violet → blue → cyan → transparent
   */
  gradient_animation: {
    colors: {
      violet: '#8b5cf6',
      blue: '#3b82f6',
      cyan: '#06b6d4',
    },
    css: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 25%, #06b6d4 50%, transparent 75%, transparent 100%)',
  },

  /**
   * Brand colors
   */
  colors: {
    violet: '#667eea',
    purple: '#764ba2',
    primaryTransparent: 'rgba(102, 126, 234, 0.2)',
  },

  /**
   * Logo paths
   */
  logo: {
    svg: 'icons/logo.svg',
    png: 'icons/logo.png',
    icon16: 'icons/icon16.png',
    icon48: 'icons/icon48.png',
    icon128: 'icons/icon128.png',
  },

  /**
   * Shadow values for consistency
   */
  shadows: {
    button: '0 2px 8px rgba(0, 0, 0, 0.3)',
    buttonHover: '0 4px 12px rgba(0, 0, 0, 0.4)',
    icon: '0 2px 4px rgba(102, 126, 234, 0.4)',
    iconHover: '0 4px 8px rgba(102, 126, 234, 0.6)',
  },
} as const

/**
 * Helper function to get gradient CSS
 */
export function getPrimaryGradient(): string {
  return DesignTokens.gradient.primary
}

/**
 * Helper function to get animation gradient CSS
 */
export function getAnimationGradient(): string {
  return DesignTokens.gradient_animation.css
}

/**
 * Helper function to get logo URL in extension context
 */
export function getLogoUrl(type: 'svg' | 'png' | 'icon16' | 'icon48' | 'icon128' = 'svg'): string {
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    return chrome.runtime.getURL(DesignTokens.logo[type])
  }
  return ''
}
