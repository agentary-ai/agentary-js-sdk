import { Logger } from "../utils/Logger";

interface ApiClientConfig {
  baseUrl: string;
  apiKey: string;
}

/**
 * API Client for handling HTTP requests
 */
export class ApiClient {
  private config: ApiClientConfig;
  private logger: Logger;
  private baseUrl: string;
  private apiKey: string;

  /**
   * Create an API client
   * @param {Object} config - Configuration object
   * @param {Logger} logger - Logger instance
   */
  constructor(config: ApiClientConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
  }

  /**
   * Make a GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Query parameters
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint: string, params: Record<string, string> = {}) {
    return this._request('GET', endpoint, null, params);
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint: string, data: Record<string, any> = {}) {
    return this._request('POST', endpoint, data);
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint: string, data: Record<string, any> = {}) {
    return this._request('PUT', endpoint, data);
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint: string) {
    return this._request('DELETE', endpoint);
  }

  /**
   * Internal method to make HTTP requests
   * @private
   */
  async _request(method: string, endpoint: string, data: any = null, params: Record<string, string> = {}) {
    const url = new URL(endpoint, this.baseUrl);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    const options: {
      method: string;
      headers: {
        'Content-Type': string;
        'Authorization': string;
        'User-Agent': string;
      };
      body?: string;
    } = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'User-Agent': 'Agentary-JS-SDK/1.0.0'
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }

    this.logger.debug(`${method} ${url.toString()}`);

    try {
      const response = await fetch(url.toString(), options);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      this.logger.debug('Response received:', responseData);
      
      return responseData;
    } catch (error) {
      this.logger.error('Request failed:', error);
      throw error;
    }
  }
} 