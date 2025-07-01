import { Logger } from '../../utils/Logger';
import { WebLLMClient } from '../llm/WebLLMClient';
import { summarizeContent } from '../../summarize';
import { explainText } from '../../explain/index';
import { generatePrompts } from '../../prompts/index';
import { postMessage } from '../../chat/index';
import type { 
  AgentaryClientConfig,
  SummarizeContentOptions,
  GeneratePromptsOptions,
  ExplainTextOptions,
  PostMessageOptions,
} from '../../types/AgentaryClient';

/**
 * Service for handling content operations
 */
export class ContentService {
  private logger: Logger;
  private config: AgentaryClientConfig;

  constructor(config: AgentaryClientConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Summarize content using the LLM
   */
  summarizeContent(llmClient: WebLLMClient, options: SummarizeContentOptions = {}) {
    return summarizeContent(llmClient, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      ...options
    }, this.logger);
  }

  /**
   * Explain selected text using the LLM
   */
  explainSelectedText(llmClient: WebLLMClient, options: ExplainTextOptions = {}) {
    return explainText(llmClient, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      selectedText: true,
      ...options
    }, this.logger);
  }

  /**
   * Generate page prompts using the LLM
   */
  generatePagePrompts(llmClient: WebLLMClient, options: GeneratePromptsOptions = {}) {
    return generatePrompts(llmClient, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      ...options
    }, this.logger);
  }

  /**
   * Post a message to the LLM
   */
  postMessage(
    llmClient: WebLLMClient,
    message: string,
    options: PostMessageOptions = {}
  ) {
    return postMessage(llmClient, message, {
      ...(this.config.contentSelector && { contentSelector: this.config.contentSelector }),
      ...options
    }, this.logger);
  }
} 