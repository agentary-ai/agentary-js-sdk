import { Logger } from "../../utils/Logger";
import { WebLLMClient } from "./WebLLMClient";
import { ProxyLLMClient } from "./ProxyLLMClient";
import { CloudLLMClient } from "./CloudLLMClient";
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
        
      default:
        logger.error(`Unsupported browser LLM provider: ${config.provider}`);
        throw new Error(`Unsupported browser LLM provider: ${config.provider}`);
    }
  }
} 