/**
 * API Client for handling HTTP requests
 */
export class ApiClient {
  /**
   * Create an API client
   * @param {Object} config - Configuration object
   * @param {Logger} logger - Logger instance
   */
  constructor(config, logger) {
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
  async get(endpoint, params = {}) {
    return this._request('GET', endpoint, null, params);
  }

  /**
   * Make a POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = {}) {
    return this._request('POST', endpoint, data);
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data = {}) {
    return this._request('PUT', endpoint, data);
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - API endpoint
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint) {
    return this._request('DELETE', endpoint);
  }

  /**
   * Internal method to make HTTP requests
   * @private
   */
  async _request(method, endpoint, data = null, params = {}) {
    const url = new URL(endpoint, this.baseUrl);
    
    // Add query parameters
    Object.keys(params).forEach(key => {
      url.searchParams.append(key, params[key]);
    });

    const options = {
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