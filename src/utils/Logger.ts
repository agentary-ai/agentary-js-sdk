/**
 * Logger utility for the SDK
 */
export class Logger {
  private debugEnabled: boolean;
  private prefix: string;

  /**
   * Create a logger instance
   * @param {boolean} debugEnabled - Enable debug logging
   */
  constructor(debugEnabled = false) {
    this.debugEnabled = debugEnabled;
    this.prefix = '[Agentary SDK]';
  }

  /**
   * Get formatted timestamp
   * @returns {string} Formatted timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Log an info message
   * @param {...unknown} args - Arguments to log
   */
  info(...args: unknown[]) {
    console.log(`${this.getTimestamp()} ${this.prefix}`, ...args);
  }

  /**
   * Log a warning message
   * @param {...unknown} args - Arguments to log
   */
  warn(...args: unknown[]) {
    console.warn(`${this.getTimestamp()} ${this.prefix}`, ...args);
  }

  /**
   * Log an error message
   * @param {...unknown} args - Arguments to log
   */
  error(...args: unknown[]) {
    console.error(`${this.getTimestamp()} ${this.prefix}`, ...args);
  }

  /**
   * Log a debug message (only if debug mode is enabled)
   * @param {...unknown} args - Arguments to log
   */
  debug(...args: unknown[]) {
    if (this.debugEnabled) {
      console.debug(`${this.getTimestamp()} ${this.prefix} [DEBUG]`, ...args);
    }
  }

  /**
   * Enable or disable debug logging
   * @param {boolean} enabled - Whether to enable debug logging
   */
  setDebug(enabled: boolean) {
    this.debugEnabled = enabled;
  }
} 