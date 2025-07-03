import { Logger } from "../../utils/Logger";
import { WebLLMClient } from "./WebLLMClient";
import { ProxyLLMClient } from "./ProxyLLMClient";
import { CloudLLMClient } from "./CloudLLMClient";
import { FallbackLLMClient } from "./FallbackLLMClient";
import { LLMClient, LLMClientConfig } from "./LLMClientInterface";
import { getCurrentEnvironment } from "../../utils/Environment";

export class LLMClientFactory {
  static async create(
    config: LLMClientConfig, 
    logger: Logger
  ): Promise<LLMClient> {
    switch (config.provider) {
      case 'webllm':
        logger.debug('Creating WebLLMClient');
        return new WebLLMClient(
          logger, 
          config.model || "Llama-3.2-1B-Instruct-q4f16_1-MLC",
          undefined,
          config.useWorker ?? true
        );
        
      case 'proxy':
        logger.debug('Creating ProxyLLMClient');
        if (!config.proxyUrl) {
          throw new Error('proxyUrl is required for proxy provider');
        }
        return new ProxyLLMClient(config, logger);

      case 'cloud':
        logger.debug('Creating CloudLLMClient');
        return new CloudLLMClient(config, logger);

      case 'fallback':
        if (!config.apiKey) {
          throw new Error('apiKey is required for fallback provider (CloudLLM fallback)');
        }
        
        // Check environment to determine client strategy
        const currentEnv = getCurrentEnvironment();
        const isChromeDesktop = currentEnv.browser === 'chrome' && currentEnv.device === 'desktop';
        
        if (isChromeDesktop) {
          logger.debug('Creating FallbackLLMClient (WebLLM with CloudLLM fallback) for Chrome desktop');
          
          // Create WebLLM client
          const webLLMClient = new WebLLMClient(
            logger, 
            config.model || "Llama-3.2-1B-Instruct-q4f16_1-MLC",
            undefined,
            config.useWorker ?? true
          );
          
          // Create CloudLLM client for fallback
          const cloudLLMClient = new CloudLLMClient(config, logger);
          
          // Return fallback client that wraps both
          return new FallbackLLMClient(webLLMClient, cloudLLMClient, logger);
        } else {
          logger.debug(`Creating CloudLLMClient directly for ${currentEnv.browser} on ${currentEnv.device} (not Chrome desktop)`);
          
          // For non-Chrome desktop environments, use CloudLLMClient directly
          return new CloudLLMClient(config, logger);
        }
        
      default:
        logger.error(`Unsupported browser LLM provider: ${config.provider}`);
        throw new Error(`Unsupported browser LLM provider: ${config.provider}`);
    }
  }
} 