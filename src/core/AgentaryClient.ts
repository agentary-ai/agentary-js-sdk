// import { ApiClient } from './api/ApiClient.js';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { Analytics, setAnalytics } from '../utils/Analytics';
import { isEnvironmentAllowed, getCurrentEnvironment } from '../utils/Environment';
import { WebLLMClient } from './llm/WebLLMClient';
import { summarizeContent } from '../summarize';
import { explainText } from '../explain/index';
import { generatePrompts } from '../prompts/index';
import { postMessage } from '../chat/index';
import { mountWidget, unmountWidget, unmountAllWidgets, getMountedWidgets } from '../ui';
import { LLMClientFactory } from './llm/LLMClientFactory';
import { LLMClient } from './llm/LLMClientInterface';

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
  private llmClient!: LLMClient;
  private analytics: Analytics;

  /**
   * Create an Agentary SDK instance
   * @param {AgentaryClientConfig} config - Configuration options
   */
  constructor(config: AgentaryClientConfig = {
    debug: false,
    loadModel: true,
    provider: 'webllm',
    showWidgetOnInit: true,
    generatePagePrompts: true,
    maxPagePrompts: 5,
  }) {
    super();
    this.config = config;
    this.logger = new Logger(this.config.debug);
    
    // Check environment compatibility before initializing
    const currentEnv = getCurrentEnvironment();
    this.logger.debug('Current environment:', currentEnv);
    
    // Apply default environment restrictions if none specified
    const envConfig = this.config.environment || {
      allowedDevices: ['desktop'],
      allowedBrowsers: ['chrome']
    };
    
    const isAllowed = isEnvironmentAllowed(
      envConfig.allowedDevices,
      envConfig.allowedBrowsers,
      envConfig.disallowedDevices,
      envConfig.disallowedBrowsers
    );
    
    if (!isAllowed) {
      const errorMsg = `SDK not supported in current environment. Current: ${currentEnv.browser} on ${currentEnv.device}. ` +
        `Allowed devices: ${envConfig.allowedDevices?.join(', ') || 'any'}. ` +
        `Allowed browsers: ${envConfig.allowedBrowsers?.join(', ') || 'any'}.`;
      this.logger.error(errorMsg);
      throw new Error(errorMsg);
    }
    
    this.logger.info(
      `Initializing with config: ${JSON.stringify(this.config)}`
    );
    this.logger.info(`Environment check passed: ${currentEnv.browser} on ${currentEnv.device}`);

    // Initialize analytics
    this.analytics = new Analytics({
      enabled: true,
      debug: this.config.debug || false,
    }, this.logger);

    this.analytics.setupPageTimeTracking();

    // Set global analytics instance
    setAnalytics(this.analytics);

    // TODO: Add once API is implemented
    // this.apiClient = new ApiClient(this.config, this.logger);
    
    // Initialize LLM client
    this.initializeLLMClient().then(() => {
      if (this.config.showWidgetOnInit) {
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

        this.logger.debug('Mounting widget');
        
        mountWidget(
          this.llmClient as WebLLMClient,
          widgetOptions,
          this.logger
        );
      }
    });

    // Set up page unload handler to flush analytics
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.analytics.flush();
      });
    }
  }
  
  private async initializeLLMClient() {
    this.logger.debug('Initializing LLM client');
    this.llmClient = await LLMClientFactory.create({
      provider: this.config.provider || 'webllm',
      model: this.config.model,
      proxyUrl: this.config.proxyUrl,
      proxyHeaders: this.config.proxyHeaders,
      useWorker: this.config.useWorker
    }, this.logger);
    
    if (this.config.loadModel && this.llmClient.init) {
      await this.llmClient.init();
    }
  }

  /**
   * Mount a new widget with the specified options
   * @param {WidgetOptions} options - Widget configuration options
   * @returns Object with unmount function and widget ID
   */
  mountWidget(options: WidgetOptions = {}): { unmount: () => void; widgetId: string } {
    const widgetOptions: WidgetOptions = {
      position: "bottom-right",
      autoOpenOnLoad: false,
      generatePagePrompts: this.config.generatePagePrompts || false,
      maxPagePrompts: this.config.maxPagePrompts || 5,
      ...options
    };
    
    // Add contentSelector from config if not provided in options
    if (this.config.contentSelector && !widgetOptions.contentSelector) {
      widgetOptions.contentSelector = this.config.contentSelector;
    }

    this.logger.info('Mounting widget with options:', widgetOptions);
    
    return mountWidget(
      this.llmClient as WebLLMClient,
      widgetOptions,
      this.logger
    );
  }

  /**
   * Unmount a specific widget by ID
   * @param {string} widgetId - The ID of the widget to unmount
   * @returns boolean indicating success
   */
  unmountWidget(widgetId: string): boolean {
    this.logger.info(`Unmounting widget: ${widgetId}`);
    return unmountWidget(widgetId);
  }

  /**
   * Unmount all mounted widgets
   * @returns number of widgets unmounted
   */
  unmountAllWidgets(): number {
    this.logger.info('Unmounting all widgets');
    return unmountAllWidgets();
  }

  /**
   * Get information about all mounted widgets
   * @returns Array of widget information
   */
  getMountedWidgets(): Array<{ widgetId: string; hasButton: boolean; hasDialog: boolean }> {
    return getMountedWidgets();
  }

  summarizeContent(options: SummarizeContentOptions = {}) {
    return summarizeContent(this.llmClient as WebLLMClient, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      ...options
    }, this.logger);
  }

  explainSelectedText(options: ExplainTextOptions = {}) {
    return explainText(this.llmClient as WebLLMClient, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      selectedText: true,
      ...options
    }, this.logger);
  }

  generatePagePrompts(options: GeneratePromptsOptions = {}) {
    return generatePrompts(this.llmClient as WebLLMClient, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      ...options
    }, this.logger);
  }

  postMessage(
    message: string,
    options: PostMessageOptions = {}
  ) {
    return postMessage(this.llmClient as WebLLMClient, message, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      ...options
    }, this.logger);
  }
}