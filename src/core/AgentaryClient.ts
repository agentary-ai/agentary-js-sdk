// import { ApiClient } from './core/ApiClient.js';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { WebLLMClient } from './WebLLMClient';
import { summarizeContent } from '../summarize';
import { explainText } from '../explain/index.js';
import { generatePrompts } from '../prompts/index';
import { postMessage } from '../chat/index.js';
// import { mountWidget } from '../ui/widget.js';

import type { 
  AgentaryClientConfig,
  SummarizeContentOptions,
  GeneratePromptsOptions,
  ExplainTextOptions,
  PostMessageOptions
} from '../types/AgentaryClient';
import type { InitProgressReport, ChatCompletionMessageParam } from '@mlc-ai/web-llm';

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
    
    // if (this.config.showWidget) {
    //   mountWidget(
    //     this.webLLMClient, 
    //     "bottom-right",
    //     {
    //       autoOpenOnLoad: true,
    //       generatePagePrompts: this.config.generatePagePrompts,
    //       maxPagePrompts: this.config.maxPagePrompts,
    //       contentSelector: this.config.contentSelector
    //     }
    //   );
    // }
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