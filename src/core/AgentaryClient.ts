// import { ApiClient } from './core/ApiClient.js';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { WebLLMClient } from './WebLLMClient';
import { summarizeContent } from '../summarize';
import { explainText } from '../explain/index';
import { generatePrompts } from '../prompts/index';
import { postMessage } from '../chat/index';
import { mountWidget } from '../ui/widget';

import type { 
  AgentaryClientConfig,
  SummarizeContentOptions,
  GeneratePromptsOptions,
  ExplainTextOptions,
  PostMessageOptions,
} from '../types/AgentaryClient';
import { WidgetOptions } from '../types/index';
import type { InitProgressReport } from '@mlc-ai/web-llm';

/**
 * Main Agentary SDK class
 */
export class AgentaryClient extends EventEmitter {
  private config: AgentaryClientConfig;
  private logger: Logger;
  private webLLMClient: WebLLMClient;

  /**
   * Create an Agentary SDK instance
   * @param {AgentaryClientConfig} config - Configuration options
   */
  constructor(config: AgentaryClientConfig = {
    loadModel: true,
    debug: false,
    showWidget: true,
    generatePagePrompts: true,
    maxPagePrompts: 5,
  }) {
    super();
    this.config = config;
    this.logger = new Logger(this.config.debug);
    this.logger.info(
      `Initializing with config: ${JSON.stringify(this.config)}`
    );

    // TODO: Add once API is implemented
    // this.apiClient = new ApiClient(this.config, this.logger);
    
    this.webLLMClient = new WebLLMClient(
      this.logger,
      "Llama-3.2-1B-Instruct-q4f16_1-MLC",
      (p: InitProgressReport) => { this.logger.debug(p); },
      true
    );

    if (this.config.loadModel) {
      this.webLLMClient.createEngine();
    }
    
    if (this.config.showWidget) {
      const widgetOptions: WidgetOptions = {
        position: "bottom-right",
        autoOpenOnLoad: true,
        generatePagePrompts: this.config.generatePagePrompts || false,
        maxPagePrompts: this.config.maxPagePrompts || 5,
      };
      
      // Only add contentSelector if it's defined
      if (this.config.contentSelector) {
        widgetOptions.contentSelector = this.config.contentSelector;
      }
      
      mountWidget(
        this.webLLMClient, 
        widgetOptions,
        this.logger
      );
    }
  }

  summarizeContent(options: SummarizeContentOptions = {}) {
    return summarizeContent(this.webLLMClient, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      ...options
    }, this.logger);
  }

  explainSelectedText(options: ExplainTextOptions = {}) {
    return explainText(this.webLLMClient, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      selectedText: true,
      ...options
    }, this.logger);
  }

  generatePagePrompts(options: GeneratePromptsOptions = {}) {
    return generatePrompts(this.webLLMClient, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      ...options
    }, this.logger);
  }

  postMessage(
    message: string,
    options: PostMessageOptions = {}
  ) {
    return postMessage(
      this.webLLMClient,
      message,
      {
        ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
        ...options
      },
      this.logger
    );
  }
}