/**
 * Agentary JavaScript SDK
 * Main entry point for the SDK
 */

import { ApiClient } from './core/ApiClient.js';
import { EventEmitter } from './utils/EventEmitter.js';
import { Logger } from './utils/Logger.js';

/**
 * Main Agentary SDK class
 */
export class Agentary extends EventEmitter {
  /**
   * Create an Agentary SDK instance
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Your API key
   * @param {string} [config.baseUrl] - Base URL for the API
   * @param {boolean} [config.debug=false] - Enable debug logging
   */
  constructor(config = {}) {
    super();
    
    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.config = {
      baseUrl: 'https://api.agentary.com',
      debug: false,
      ...config
    };

    this.logger = new Logger(this.config.debug);
    this.apiClient = new ApiClient(this.config, this.logger);
    
    this.logger.info('Agentary SDK initialized');
  }

  /**
   * Get SDK version
   * @returns {string} SDK version
   */
  getVersion() {
    return '1.0.0';
  }

  /**
   * Test connection to the API
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      await this.apiClient.get('/health');
      return true;
    } catch (error) {
      this.logger.error('Connection test failed:', error);
      return false;
    }
  }
}

// Export default instance creator
export default Agentary;

// Export all modules for advanced usage
export * from './core/index.js';
export * from './utils/index.js'; 