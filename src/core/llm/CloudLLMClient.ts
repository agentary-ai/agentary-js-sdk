import { Logger } from "../../utils/Logger";
import { ProxyLLMClient } from "./ProxyLLMClient";
import { LLMClientConfig } from "./LLMClientInterface";

// TODO: Move CloudLLMClient to a separate service
const DEFAULT_CLOUD_URL = 'https://agentary-backend-667848593924.us-central1.run.app';
const DEFAULT_RETRY_CONFIG = {
  maxRetries: 3,
  backoffMs: 1000
};

export class CloudLLMClient extends ProxyLLMClient {
  private retryConfig: typeof DEFAULT_RETRY_CONFIG;

  constructor(config: LLMClientConfig, logger: Logger) {
    if (!config.apiKey) {
      throw new Error('apiKey is required for cloud provider');
    }

    const cloudConfig: LLMClientConfig = {
      ...config,
      proxyUrl: config.proxyUrl || DEFAULT_CLOUD_URL,
      proxyHeaders: {
        'Authorization': `Bearer ${config.apiKey}`,
        ...(config.organizationId && { 'X-Organization-ID': config.organizationId }),
        'Content-Type': 'application/json',
        ...config.proxyHeaders
      }
    };

    super(cloudConfig, logger);
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...config.retryConfig
    };
  }

  protected override async handleRequest(request: Request): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(request);
        
        // Don't retry on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }
        
        // Don't retry on successful responses
        if (response.ok) {
          return response;
        }

        // For 5xx errors, throw to trigger retry
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status}`);
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        
        // Wait before retrying
        if (attempt < this.retryConfig.maxRetries - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, this.retryConfig.backoffMs * Math.pow(2, attempt))
          );
        }
      }
    }

    throw lastError || new Error('Request failed after all retries');
  }
} 