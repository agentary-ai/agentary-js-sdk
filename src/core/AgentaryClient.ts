import { ApiClient } from './api/ApiClient';
import { EventEmitter } from '../utils/EventEmitter';
import { Logger } from '../utils/Logger';
import { Analytics, setAnalytics } from '../utils/Analytics';
import { isEnvironmentAllowed, getCurrentEnvironment } from '../utils/Environment';
import { WebLLMClient } from './llm/WebLLMClient';
import { LLMClientFactory } from './llm/LLMClientFactory';
import { LLMClient } from './llm/LLMClientInterface';
import { WidgetService, ContentService, RelatedArticlesService } from './services';

import type { 
  AgentaryClientConfig,
  SummarizeContentOptions,
  GeneratePromptsOptions,
  ExplainTextOptions,
  PostMessageOptions,
  GetRelatedArticlesOptions,
  RelatedArticlesResponse,
  SimilarPage,
  RelatedArticlesStatistics,
} from '../types/AgentaryClient';
import { WidgetOptions } from '../types/index';

/**
 * Main Agentary SDK class
 */
export class AgentaryClient extends EventEmitter {
  private config: AgentaryClientConfig;
  private logger: Logger;
  private llmClient!: LLMClient;
  private analytics: Analytics;
  private apiClient: ApiClient;
  private widgetService: WidgetService;
  private contentService: ContentService;
  private relatedArticlesService: RelatedArticlesService;

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

    // Initialize API client for backend communication
    const backendUrl = this.config.baseUrl || 'https://agentary-backend-667848593924.us-central1.run.app';
    const apiKey = this.config.apiKey || '';
    
    this.apiClient = new ApiClient({
      baseUrl: backendUrl,
      apiKey: apiKey
    }, this.logger);
    
    this.logger.info(`API client initialized with backend URL: ${backendUrl}`);
    
    // Initialize services
    this.relatedArticlesService = new RelatedArticlesService(this.config, this.apiClient, this.logger);
    this.widgetService = new WidgetService(this.config, this.logger, this.relatedArticlesService);
    this.contentService = new ContentService(this.config, this.logger);
    
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

        this.logger.debug('Mounting widget', this.llmClient);
        
        this.widgetService.mountWidget(
          this.llmClient as WebLLMClient,
          widgetOptions
        );

        // Start loading the model **after** the widget has mounted so the
        // FloatingActionButton can reflect the loading state.
        if (this.config.loadModel && this.llmClient.init) {
          // Fire-and-forget — we don't want to block the UI thread here.
          this.llmClient.init().catch((err: unknown) => {
            this.logger.error('Model initialization failed:', err);
          });
        }
      }

      if (!this.config.showWidgetOnInit) {
        // When the widget isn't shown automatically we still honour the
        // loadModel flag and begin loading immediately in the background.
        if (this.config.loadModel && this.llmClient.init) {
          this.llmClient.init().catch((err: unknown) => {
            this.logger.error('Model initialization failed:', err);
          });
        }
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
    
    // NOTE: We intentionally do NOT call llmClient.init() here anymore.
    // Model loading will be triggered after the UI widget is mounted so the
    // spinner can be displayed while the model is initializing.
  }

  /**
   * Mount a new widget with the specified options
   * @param {WidgetOptions} options - Widget configuration options
   * @returns Object with unmount function and widget ID
   */
  mountWidget(options: WidgetOptions = {}): { unmount: () => void; widgetId: string } {
    return this.widgetService.mountWidget(this.llmClient as WebLLMClient, options);
  }

  /**
   * Unmount a specific widget by ID
   * @param {string} widgetId - The ID of the widget to unmount
   * @returns boolean indicating success
   */
  unmountWidget(widgetId: string): boolean {
    return this.widgetService.unmountWidget(widgetId);
  }

  /**
   * Unmount all mounted widgets
   * @returns number of widgets unmounted
   */
  unmountAllWidgets(): number {
    return this.widgetService.unmountAllWidgets();
  }

  /**
   * Get information about all mounted widgets
   * @returns Array of widget information
   */
  getMountedWidgets(): Array<{ widgetId: string; hasButton: boolean; hasDialog: boolean }> {
    return this.widgetService.getMountedWidgets();
  }

  /**
   * Get the API client for making backend requests
   * @returns {ApiClient} The initialized API client
   */
  getApiClient(): ApiClient {
    return this.apiClient;
  }

  /**
   * Get related articles for the current page from the backend
   * @param {GetRelatedArticlesOptions} options - Options for retrieving related articles
   * @returns {Promise<RelatedArticlesResponse>} Related articles response from backend
   */
  async getRelatedArticles(options: GetRelatedArticlesOptions = {}): Promise<RelatedArticlesResponse> {
    return this.relatedArticlesService.getRelatedArticles(options);
  }

  /**
   * Get just the similar pages from related articles (convenience method)
   * @param {GetRelatedArticlesOptions} options - Options for retrieving related articles
   * @returns {Promise<SimilarPage[]>} Array of similar pages
   */
  async getSimilarPages(options: GetRelatedArticlesOptions = {}): Promise<SimilarPage[]> {
    return this.relatedArticlesService.getSimilarPages(options);
  }

  /**
   * Get related articles statistics (convenience method)
   * @param {GetRelatedArticlesOptions} options - Options for retrieving related articles
   * @returns {Promise<RelatedArticlesStatistics>} Statistics about the related articles
   */
  async getRelatedArticlesStats(options: GetRelatedArticlesOptions = {}): Promise<RelatedArticlesStatistics> {
    return this.relatedArticlesService.getRelatedArticlesStats(options);
  }

  summarizeContent(options: SummarizeContentOptions = {}) {
    return this.contentService.summarizeContent(this.llmClient as WebLLMClient, options);
  }

  explainSelectedText(options: ExplainTextOptions = {}) {
    return this.contentService.explainSelectedText(this.llmClient as WebLLMClient, options);
  }

  generatePagePrompts(options: GeneratePromptsOptions = {}) {
    return this.contentService.generatePagePrompts(this.llmClient as WebLLMClient, options);
  }

  postMessage(
    message: string,
    options: PostMessageOptions = {}
  ) {
    return this.contentService.postMessage(this.llmClient as WebLLMClient, message, options);
  }
}