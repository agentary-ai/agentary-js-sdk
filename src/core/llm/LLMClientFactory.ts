import { Logger } from "../../utils/Logger";
import { WebLLMClient } from "./WebLLMClient";
import { ProxyLLMClient } from "./ProxyLLMClient";
import { CloudLLMClient } from "./CloudLLMClient";
import { FallbackLLMClient } from "./FallbackLLMClient";
import { LLMClient, LLMClientConfig } from "./LLMClientInterface";

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
        logger.debug('Creating FallbackLLMClient (WebLLM with CloudLLM fallback)');
        if (!config.apiKey) {
          throw new Error('apiKey is required for fallback provider (CloudLLM fallback)');
        }
        
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
        
      default:
        logger.error(`Unsupported browser LLM provider: ${config.provider}`);
        throw new Error(`Unsupported browser LLM provider: ${config.provider}`);
    }
  }
} 