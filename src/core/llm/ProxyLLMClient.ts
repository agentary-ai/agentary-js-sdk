import { Logger } from "../../utils/Logger";
import { getAnalytics } from "../../utils/Analytics";
import { 
  LLMClient, 
  LLMClientConfig, 
  ChatCompletionOptions, 
  ChatCompletion 
} from "./LLMClientInterface";
import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

export class ProxyLLMClient implements LLMClient {
  protected config: LLMClientConfig;
  private logger: Logger;
  private currentAbortController: AbortController | null = null;

  constructor(config: LLMClientConfig, logger: Logger) {
    if (!config.proxyUrl) {
      throw new Error('proxyUrl is required for proxy provider');
    }
    this.config = config;
    this.logger = logger;
  }

  get isReady(): boolean {
    return true; // Proxy is always "ready"
  }

  /**
   * Interrupt the current generation by aborting the request
   */
  async interruptGenerate(): Promise<void> {
    if (this.currentAbortController) {
      this.logger.debug('Interrupting proxy request');
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }

  async chatCompletion(
    messages: ChatCompletionMessageParam[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletion> {
    const analytics = getAnalytics();
    const responseStartTime = Date.now();

    // Create abort controller for this request
    this.currentAbortController = new AbortController();

    try {
      const response = await this.handleRequest(new Request(`${this.config.proxyUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.proxyHeaders
        },
        body: JSON.stringify({
          messages,
          stream: options.stream,
          model: this.config.model,
          response_format: { type: options.responseFormat || 'text' }
        })
      }), this.currentAbortController.signal);

      if (!response.ok) {
        throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
      }

      if (options.stream) {
        return this.handleStreamingResponse(response, options.onStreamToken);
      }

      const result = await response.json();

      // Track successful response
      analytics?.track('ai_response_received', {
        response_time_ms: Date.now() - responseStartTime,
        response_length: result.choices[0]?.message?.content?.length || 0,
        feature_used: 'chat',
        streaming: false,
        page_url: window.location.href,
        page_domain: window.location.hostname,
      });

      return result;
    } catch (error) {
      // Handle abort errors gracefully
      if (error instanceof Error && error.name === 'AbortError') {
        this.logger.debug('Request was aborted');
        throw new Error('Request was interrupted');
      }

      // Track errors
      analytics?.track('error_occurred', {
        error_type: 'proxy_request_error',
        error_message: error instanceof Error ? error.message : String(error),
        feature: 'chat',
        page_url: window.location.href,
        page_domain: window.location.hostname,
      });

      throw error;
    } finally {
      // Clean up the abort controller
      this.currentAbortController = null;
    }
  }

  protected async handleRequest(request: Request, signal?: AbortSignal): Promise<Response> {
    const requestInit: RequestInit = {};
    if (signal) {
      requestInit.signal = signal;
    }
    return fetch(request, requestInit);
  }

  private async handleStreamingResponse(
    response: Response,
    onStreamToken?: (token: string) => void
  ): Promise<ChatCompletion> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let lastChunk: any = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              lastChunk = parsed;

              if (parsed.choices?.[0]?.delta?.content) {
                const token = parsed.choices[0].delta.content;
                fullContent += token;
                if (onStreamToken) {
                  onStreamToken(token);
                }
              }
            } catch (e) {
              this.logger.warn('Failed to parse streaming chunk:', e);
            }
          }
        }
      }

      // Construct final ChatCompletion object
      if (lastChunk) {
        return {
          id: lastChunk.id,
          object: 'chat.completion',
          created: lastChunk.created,
          model: lastChunk.model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: fullContent
            },
            finish_reason: lastChunk.choices?.[0]?.finish_reason || 'stop',
            logprobs: null
          }],
          usage: lastChunk.usage || {
            prompt_tokens: 0,
            completion_tokens: 0,
            total_tokens: 0
          }
        };
      }

      throw new Error('No valid chunks received from streaming response');
    } finally {
      reader.releaseLock();
    }
  }
} 