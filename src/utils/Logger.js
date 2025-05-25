/**
 * Logger utility for the SDK
 */
export class Logger {
  /**
   * Create a logger instance
   * @param {boolean} debug - Enable debug logging
   */
  constructor(debug = false) {
    this.debug = debug;
    this.prefix = '[Agentary SDK]';
  }

  /**
   * Log an info message
   * @param {...any} args - Arguments to log
   */
  info(...args) {
    console.log(this.prefix, ...args);
  }

  /**
   * Log a warning message
   * @param {...any} args - Arguments to log
   */
  warn(...args) {
    console.warn(this.prefix, ...args);
  }

  /**
   * Log an error message
   * @param {...any} args - Arguments to log
   */
  error(...args) {
    console.error(this.prefix, ...args);
  }

  /**
   * Log a debug message (only if debug mode is enabled)
   * @param {...any} args - Arguments to log
   */
  debug(...args) {
    if (this.debug) {
      console.debug(this.prefix, '[DEBUG]', ...args);
    }
  }

  /**
   * Enable or disable debug logging
   * @param {boolean} enabled - Whether to enable debug logging
   */
  setDebug(enabled) {
    this.debug = enabled;
  }
} 