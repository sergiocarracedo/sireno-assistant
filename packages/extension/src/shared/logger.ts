/**
 * Centralized logging utility with environment-based log levels
 *
 * Usage:
 * ```typescript
 * import { createLogger } from './shared/logger'
 *
 * const logger = createLogger('ComponentName')
 * logger.debug('Detailed info for debugging')
 * logger.info('General information')
 * logger.warn('Warning message')
 * logger.error('Error occurred', error)
 * ```
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4,
}

interface LoggerConfig {
  level?: LogLevel;
  prefix?: string;
  enableTimestamp?: boolean;
}

class Logger {
  private level: LogLevel;
  private prefix: string;
  private enableTimestamp: boolean;

  constructor(config: LoggerConfig = {}) {
    // Default to DEBUG in development, WARN in production
    this.level = config.level ?? this.getDefaultLevel();
    this.prefix = config.prefix ?? "";
    this.enableTimestamp = config.enableTimestamp ?? true;
  }

  private getDefaultLevel(): LogLevel {
    // Read from environment variable
    const envLevel = import.meta.env.VITE_LOG_LEVEL as string | undefined;

    if (envLevel) {
      const upperLevel = envLevel.toUpperCase();
      if (upperLevel in LogLevel) {
        return LogLevel[upperLevel as keyof typeof LogLevel];
      }
    }

    // Default: DEBUG in dev, WARN in production
    return import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.WARN;
  }

  private formatMessage(level: string, args: any[]): any[] {
    const parts: any[] = [];

    // Add timestamp if enabled
    if (this.enableTimestamp) {
      const timestamp = new Date().toISOString().split("T")[1].slice(0, -1);
      parts.push(`[${timestamp}]`);
    }

    // Add log level
    parts.push(`[${level}]`);

    // Add prefix if present
    if (this.prefix) {
      parts.push(`[${this.prefix}]`);
    }

    // Add the actual message
    parts.push(...args);

    return parts;
  }

  /**
   * Log debug information (only in development by default)
   */
  debug(...args: any[]): void {
    if (this.level <= LogLevel.DEBUG) {
      console.log(...this.formatMessage("DEBUG", args));
    }
  }

  /**
   * Log general information
   */
  info(...args: any[]): void {
    if (this.level <= LogLevel.INFO) {
      console.info(...this.formatMessage("INFO", args));
    }
  }

  /**
   * Log warning messages
   */
  warn(...args: any[]): void {
    if (this.level <= LogLevel.WARN) {
      console.warn(...this.formatMessage("WARN", args));
    }
  }

  /**
   * Log error messages
   */
  error(...args: any[]): void {
    if (this.level <= LogLevel.ERROR) {
      console.error(...this.formatMessage("ERROR", args));
    }
  }

  /**
   * Create a child logger with a specific prefix
   */
  child(prefix: string): Logger {
    return new Logger({
      level: this.level,
      prefix: this.prefix ? `${this.prefix}:${prefix}` : prefix,
      enableTimestamp: this.enableTimestamp,
    });
  }

  /**
   * Set log level at runtime
   */
  setLevel(level: LogLevel): void {
    this.level = level;
  }

  /**
   * Get current log level
   */
  getLevel(): LogLevel {
    return this.level;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory for component-specific loggers
export function createLogger(prefix: string): Logger {
  return logger.child(prefix);
}

// Export helper to set global log level
export function setLogLevel(level: LogLevel): void {
  logger.setLevel(level);
}
