import { ChatCompletion, ChatCompletionMessageParam } from "@mlc-ai/web-llm";

// Re-export ChatCompletion for use in implementations
export type { ChatCompletion };

export type BrowserLLMProvider = 
  | 'webllm'           // Current - runs models in browser
  | 'proxy'            // User's own backend proxy
  | 'cloud'            // Agentary cloud service
  | 'fallback'         // WebLLM with CloudLLM fallback

export interface ChatCompletionOptions {
  stream: boolean;
  responseFormat?: 'text' | 'json_object';
  onStreamToken?: (token: string) => void;
}

export interface LLMClient {
  chatCompletion(
    messages: ChatCompletionMessageParam[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletion>;

  interruptGenerate?(): Promise<void>;
  getMaxStorageBufferBindingSize?(): Promise<number>;
  
  // Optional lifecycle methods
  init?(): Promise<void>;
  cleanup?(): void;
  
  // Status properties
  readonly isReady: boolean;
  readonly isLoading?: boolean;
}

export interface LLMClientConfig {
  provider: BrowserLLMProvider;
  model?: string | undefined;
  
  // For proxy/cloud providers
  proxyUrl?: string | undefined;
  proxyHeaders?: Record<string, string> | undefined;
  apiKey?: string | undefined;
  organizationId?: string | undefined;
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
  };
  
  // WebLLM specific
  useWorker?: boolean | undefined;
  modelPath?: string | undefined;
}