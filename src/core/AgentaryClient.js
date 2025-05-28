
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
      ...config
    };

    this.logger = new Logger(this.config.debug);
    this.logger.info('Initializing Agentary SDK');

    // this.apiClient = new ApiClient(this.config, this.logger);
    
    this.webLLMClient = new WebLLMClient(
      "Llama-3.2-1B-Instruct-q4f16_1-MLC", // modelPath
      (p) => { console.log(p); }, // initProgressCallback
      true // useWorker
    );

    if (this.config.loadModel) {
      this.webLLMClient.createEngine();
    }
    
    if (this.config.showWidget) {
      this.logger.info('Mounting widget');
      mountWidget(
        this.webLLMClient, 
        "bottom-right",
        {
          generateQuestions: true,
          maxQuestions: 5
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

  summarizeContent() {
    return summarizeContent(this.webLLMClient);
  }

  explainSelectedText(text = null, options = {}) {
    return explainSelectedText(this.webLLMClient, text, options);
  }

  generatePagePrompts(options = {}) {
    return generatePagePrompts(this.webLLMClient, options);
  }

  postMessage(message, options = {}) {
    return postMessage(this.webLLMClient, message, options);
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