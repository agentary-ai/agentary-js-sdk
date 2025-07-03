import { Logger } from "../../utils/Logger";
import { WebLLMClient } from "./WebLLMClient";
import { CloudLLMClient } from "./CloudLLMClient";
import { LLMClient, LLMClientConfig, ChatCompletionOptions, ChatCompletion } from "./LLMClientInterface";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

export class FallbackLLMClient implements LLMClient {
  private webLLMClient: WebLLMClient;
  private cloudLLMClient: CloudLLMClient;
  private logger: Logger;
  private webLLMInitialized: boolean = false;
  private webLLMInitializationFailed: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  constructor(
    webLLMClient: WebLLMClient,
    cloudLLMClient: CloudLLMClient,
    logger: Logger
  ) {
    this.webLLMClient = webLLMClient;
    this.cloudLLMClient = cloudLLMClient;
    this.logger = logger;
  }

  get isReady(): boolean {
    // We're ready if either client is ready
    return this.webLLMClient.isReady || this.cloudLLMClient.isReady;
  }

  get isLoading(): boolean {
    // We're loading if WebLLM is loading and cloud client isn't ready yet
    return this.webLLMClient.isLoading || false;
  }

  /**
   * Initialize the WebLLM client while keeping cloud client as fallback
   */
  async init(): Promise<void> {
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.initializeWebLLM();
    return this.initializationPromise;
  }

  private async initializeWebLLM(): Promise<void> {
    try {
      this.logger.debug('FallbackLLMClient: Starting WebLLM initialization');
      
      if (this.webLLMClient.init) {
        await this.webLLMClient.init();
      }
      
      this.webLLMInitialized = true;
      this.logger.info('FallbackLLMClient: WebLLM initialization successful');
    } catch (error) {
      this.webLLMInitializationFailed = true;
      this.logger.warn('FallbackLLMClient: WebLLM initialization failed, will use CloudLLM as fallback', error);
    }
  }

  /**
   * Determines which client to use for the request
   */
  private getActiveClient(): LLMClient {
    // Use WebLLM if it's ready
    if (this.webLLMClient.isReady) {
      this.logger.debug('FallbackLLMClient: Using WebLLMClient (ready)');
      return this.webLLMClient;
    }

    // Use CloudLLM if WebLLM failed to initialize or is still loading
    if (this.webLLMInitializationFailed || this.webLLMClient.isLoading) {
      this.logger.debug('FallbackLLMClient: Using CloudLLMClient (WebLLM not ready)');
      return this.cloudLLMClient;
    }

    // Default to CloudLLM if WebLLM state is unclear
    this.logger.debug('FallbackLLMClient: Using CloudLLMClient (default fallback)');
    return this.cloudLLMClient;
  }

  async chatCompletion(
    messages: ChatCompletionMessageParam[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletion> {
    const activeClient = this.getActiveClient();
    
    try {
      return await activeClient.chatCompletion(messages, options);
    } catch (error) {
      // If WebLLM fails and we haven't tried CloudLLM yet, fall back
      if (activeClient === this.webLLMClient && !this.webLLMInitializationFailed) {
        this.logger.warn('FallbackLLMClient: WebLLM request failed, falling back to CloudLLM', error);
        return await this.cloudLLMClient.chatCompletion(messages, options);
      }
      
      // Re-throw if we're already using CloudLLM or both have failed
      throw error;
    }
  }

  /**
   * Clean up both clients
   */
  cleanup(): void {
    if (this.webLLMClient.cleanup) {
      this.webLLMClient.cleanup();
    }
    if ('cleanup' in this.cloudLLMClient && typeof this.cloudLLMClient.cleanup === 'function') {
      this.cloudLLMClient.cleanup();
    }
  }

  /**
   * Get information about which client is currently active
   */
  getActiveClientInfo(): {
    activeClient: 'webllm' | 'cloud';
    webLLMReady: boolean;
    webLLMLoading: boolean;
    webLLMFailed: boolean;
  } {
    return {
      activeClient: this.webLLMClient.isReady ? 'webllm' : 'cloud',
      webLLMReady: this.webLLMClient.isReady,
      webLLMLoading: this.webLLMClient.isLoading || false,
      webLLMFailed: this.webLLMInitializationFailed
    };
  }

  /**
   * Set loading change callback on the WebLLM client
   */
  setOnModelLoadingChange(callback: (isLoading: boolean) => void): void {
    if (this.webLLMClient.setOnModelLoadingChange) {
      this.webLLMClient.setOnModelLoadingChange(callback);
    }
  }

  setOnModelReadyChange(callback: (isReady: boolean) => void): void {
    if (this.webLLMClient.setOnModelReadyChange) {
      this.webLLMClient.setOnModelReadyChange(callback);
    }
  }

  /**
   * Forward WebLLM-specific methods
   */
  get isUsingMainThreadForSafari(): boolean {
    if ('isUsingMainThreadForSafari' in this.webLLMClient) {
      return (this.webLLMClient as any).isUsingMainThreadForSafari;
    }
    return false;
  }

  getEngineInfo(): any {
    if ('getEngineInfo' in this.webLLMClient) {
      return (this.webLLMClient as any).getEngineInfo();
    }
    return null;
  }
} 