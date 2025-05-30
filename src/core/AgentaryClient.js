// import { ApiClient } from './core/ApiClient.js';
import { EventEmitter } from '../utils/EventEmitter.js';
import { Logger } from '../utils/Logger.js';
import { WebLLMClient } from './WebLLMClient.js';
import { summarizeContent } from '../summarize/index.js';
import { explainSelectedText } from '../explain/index.js';
import { generatePagePrompts } from '../prompts/index.js';
import { postMessage } from '../chat/index.js';
import { mountWidget } from '../ui/widget.js';

/**
 * Main Agentary SDK class
 */
export class AgentaryClient extends EventEmitter {
  /**
   * Create an Agentary SDK instance
   * @param {Object} config - Configuration options
   * @param {string} config.apiKey - Your API key
   * @param {string} [config.baseUrl] - Base URL for the API
   * @param {boolean} [config.debug=false] - Enable debug logging
   * @param {boolean} [config.loadModel=false] - Whether to load the model immediately
   * @param {string} [config.workerUrl] - Custom URL for the WebLLM worker script
   * @param {string} [config.contentSelector] - CSS selector for extracting article content from the page
   */
  constructor(config = {
    loadModel: false,
  }) {
    super();
    
    // if (!config.apiKey) {
    //   throw new Error('API key is required');
    // }

    this.config = {
      // baseUrl: 'https://api.agentary.com',
      debug: false,
      loadModel: false,
      contentSelector: null, // Will use default selectors if not provided
      ...config
    };

    this.logger = new Logger(this.config.debug);
    this.logger.info(`Initializing Agentary SDK: ${JSON.stringify(this.config)}`);

    // this.apiClient = new ApiClient(this.config, this.logger);
    
    this.webLLMClient = new WebLLMClient(
      // "Llama-3.2-1B-Instruct-q4f32_1-MLC", // modelPath
      // "Llama-3.2-1B-Instruct-q4f16_1-MLC", // modelPath
      "Llama-3.2-1B-Instruct-q0f16-MLC"

      // "Llama-3.1-8B-Instruct-q4f32_1-MLC-1k", // modelPath
      // "Qwen2-0.5B-Instruct-q4f16_1-MLC", // modelPath
      // "Hermes-3-Llama-3.2-3B-q4f16_1-MLC", // modelPath
      (p) => { console.log(p); }, // initProgressCallback
      true // useWorker
    );

    if (this.config.loadModel) {
      this.webLLMClient.createEngine();
    }
    
    if (this.config.showWidget) {
      mountWidget(
        this.webLLMClient, 
        "bottom-right",
        {
          autoOpenOnLoad: true,
          generateQuestions: this.config.generateQuestions,
          maxQuestions: this.config.maxQuestions,
          contentSelector: this.config.contentSelector
        }
      );
    }
  }

  /**
   * Get SDK version
   * @returns {string} SDK version
   */
  getVersion() {
    return '1.0.0';
  }

  summarizeContent(options = {}) {
    return summarizeContent(this.webLLMClient, {
      contentSelector: this.config.contentSelector,
      ...options
    });
  }

  explainSelectedText(text = null, options = {}) {
    return explainSelectedText(this.webLLMClient, text, {
      contentSelector: this.config.contentSelector,
      ...options
    });
  }

  generatePagePrompts(options = {}) {
    return generatePagePrompts(this.webLLMClient, {
      contentSelector: this.config.contentSelector,
      ...options
    });
  }

  postMessage(message, onToken, previousMessages = [], options = {}) {
    return postMessage(this.webLLMClient, message, onToken, previousMessages, {
      contentSelector: this.config.contentSelector,
      ...options
    });
  }

  /**
   * Test connection to the API
   * @returns {Promise<boolean>} Connection status
   */
//   async testConnection() {
//     try {
//       await this.apiClient.get('/health');
//       return true;
//     } catch (error) {
//       this.logger.error('Connection test failed:', error);
//       return false;
//     }
//   }
}