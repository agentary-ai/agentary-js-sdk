import { CreateMLCEngine, CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import type { ChatCompletion, ChatCompletionChunk, ChatCompletionMessageParam, InitProgressCallback, InitProgressReport, MLCEngine, ResponseFormat, WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { Logger } from "../../utils/Logger";
import { getAnalytics } from "../../utils/Analytics";
import { isSafari, getBrowserName } from "../../utils/BrowserDetection";
import { LLMClient, ChatCompletionOptions } from "./LLMClientInterface";

export class WebLLMClient implements LLMClient {
  private logger: Logger;
  private modelPath: string;
  private initProgressCallback: InitProgressCallback;
  private useWorker: boolean;
  private engine?: WebWorkerMLCEngine | MLCEngine | null;
  private worker?: Worker | null;
  private workerVerified?: boolean;
  private workerBlobUrl?: string | null;
  private isModelLoading?: boolean;
  private onModelLoadingChange?: (isLoading: boolean) => void;
  private onModelReadyChange?: (isReady: boolean) => void;

  constructor(
    logger: Logger,
    modelPath: string,
    initProgressCallback = (p: InitProgressReport) => {
      console.log(p);
    },
    useWorker: boolean = true,
  ) {
    this.modelPath = modelPath;
    this.initProgressCallback = initProgressCallback;
    this.useWorker = useWorker;
    this.logger = logger;
  }

  setOnModelLoadingChange(callback: (isLoading: boolean) => void) {
    this.onModelLoadingChange = callback;
  }

  setOnModelReadyChange(callback: (isReady: boolean) => void) {
    this.onModelReadyChange = callback;
  }

  get isReady(): boolean {
    return !!this.engine && !this.isModelLoading;
  }

  get isLoading(): boolean {
    return this.isModelLoading || false;
  }

  /**
   * Clean up resources including blob URLs
   */
  cleanup() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    if (this.workerBlobUrl) {
      URL.revokeObjectURL(this.workerBlobUrl);
      this.workerBlobUrl = null;
    }
    
    this.workerVerified = false;
  }

  /**
   * Create a worker using blob URL strategy (CORS-safe)
   * @returns {Promise<Worker|null>} Created worker or null
   */
  async createWebWorker(): Promise<Worker | null> {
    try {
      const workerUrl = new URL('./webllm-worker.js', import.meta.url);
      
      // Fetch the worker code
      const response = await fetch(workerUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch worker: ${response.status} ${response.statusText}`);
      }
      
      let workerCode = await response.text();
      
      // Strip source map references to prevent Safari blob URL issues
      workerCode = workerCode.replace(/\/\/# sourceMappingURL=.*$/gm, '');
      
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      this.logger.debug("Worker blob URL created:", blobUrl);

      const worker = new Worker(blobUrl);      
      this.workerBlobUrl = blobUrl;

      this.logger.debug("Worker created successfully with blob URL strategy");

      return worker;
      
    } catch (error) {
      this.logger.error("Failed to create worker:", error);
      return null;
    }
  }

  /**
   * Verify worker creation and communication
   * @param {Worker} worker - The worker to verify
   * @returns {Promise<boolean>} - True if worker is verified
   */
  async verifyWorker(worker: Worker): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.logger.warn("Worker verification timeout");
        resolve(false);
      }, 5000);

      if (!worker) {
        this.logger.error("Worker is null or undefined");
        clearTimeout(timeout);
        resolve(false);
        return;
      }

      this.logger.debug("Verifying worker communication");

      const testMessage = { type: 'ping', timestamp: Date.now() };
      
      const messageHandler = (event: MessageEvent) => {
        this.logger.debug("Worker verification - received:", event.data);
        if (event.data && (event.data.type === 'pong' || event.data.type === 'echo')) {
          worker.removeEventListener('message', messageHandler);
          worker.removeEventListener('error', errorHandler);
          clearTimeout(timeout);
          this.logger.debug("Worker verification successful");
          resolve(true);
        }
      };

      const errorHandler = (error: ErrorEvent) => {
        this.logger.error("Worker verification error:", error);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        clearTimeout(timeout);
        resolve(false);
      };

      worker.addEventListener('message', messageHandler);
      worker.addEventListener('error', errorHandler);

      try {
        worker.postMessage(testMessage);
        this.logger.debug("Worker verification - test message sent");
      } catch (error) {
        this.logger.error("Failed to send verification message:", error);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        clearTimeout(timeout);
        resolve(false);
      }
    });
  }

  async init() {
    if (!this.engine) {
      const analytics = getAnalytics();
      const modelLoadingStartTime = Date.now();
      const browserName = getBrowserName();
      
      // Track model loading start
      analytics?.track('model_loading_started', {
        model_name: this.modelPath,
        browser_name: browserName,
        page_url: window.location.href,
        page_domain: window.location.hostname,
      });

      try {
        if (this.onModelLoadingChange) {
          this.onModelLoadingChange(true);
        }
        if (this.onModelReadyChange) {
          this.onModelReadyChange(false);
        }
        this.isModelLoading = true;
        
        if (this.useWorker) {
          try {
            this.logger.debug("Attempting to create web worker engine");
            
            // Create worker using blob URL strategy
            const worker = await this.createWebWorker();
            
            if (!worker) {
              throw new Error('Failed to create worker');
            }

            this.logger.debug("Worker created successfully:", worker);

            // Verify the worker
            this.workerVerified = await this.verifyWorker(worker);
            if (!this.workerVerified) {
              worker.terminate();
              throw new Error('Worker verification failed');
            }

            this.worker = worker;

            this.logger.debug("Creating web worker engine from verified worker for model:", this.modelPath);
            this.engine = await CreateWebWorkerMLCEngine(
              this.worker,
              this.modelPath,
              {
                initProgressCallback: this.initProgressCallback
              }
            );
            this.logger.debug("Web worker engine created successfully");
          } catch (workerError) {
            this.logger.warn("Failed to create web worker engine, falling back to main thread:", workerError);
            // Clean up any partially created worker
            this.cleanup();
            // Fall back to main thread engine
            this.engine = await CreateMLCEngine(this.modelPath, {
              initProgressCallback: this.initProgressCallback
            });
          }
        } else {
          this.logger.debug("Creating main thread engine for model:", this.modelPath);
          this.engine = await CreateMLCEngine(this.modelPath, {
            initProgressCallback: this.initProgressCallback
          });
        }

        this.isModelLoading = false;
        if (this.onModelLoadingChange) {
          this.onModelLoadingChange(false);
        }
        if (this.onModelReadyChange) {
          this.onModelReadyChange(true);
        }

        // Track successful model loading
        analytics?.track('model_loading_completed', {
          model_name: this.modelPath,
          browser_name: browserName,
          loading_time_ms: Date.now() - modelLoadingStartTime,
          page_url: window.location.href,
          page_domain: window.location.hostname,
        });

        this.logger.debug("Engine created and ready");
      } catch (error) {
        this.isModelLoading = false;
        if (this.onModelLoadingChange) {
          this.onModelLoadingChange(false);
        }
        if (this.onModelReadyChange) {
          this.onModelReadyChange(false);
        }

        // Track model loading failure
        analytics?.track('model_loading_failed', {
          model_name: this.modelPath,
          browser_name: browserName,
          error: error instanceof Error ? error.message : String(error),
          page_url: window.location.href,
          page_domain: window.location.hostname,
        });

        this.logger.error("Failed to create engine:", error);
        throw error;
      }
    }
  }

  async chatCompletion(
    messages: ChatCompletionMessageParam[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletion> {
    if (!this.engine) {
      throw new Error("Engine not created");
    }

    const analytics = getAnalytics();
    const responseStartTime = Date.now();
    const isStreaming = options.stream;

    try {
      if (options.stream) {
        const chunks = await this.engine.chat.completions.create({
          messages,
          response_format: { type: options.responseFormat || 'text' },
          stream: true
        }) as AsyncIterable<ChatCompletionChunk>;

        let fullContent = '';
        let lastChunk: ChatCompletionChunk | null = null;

        // Process the stream and accumulate the full response
        for await (const chunk of chunks) {
          lastChunk = chunk;

          if (chunk.choices && chunk.choices[0]?.delta?.content) {
            const token = chunk.choices[0].delta.content;
            fullContent += token;
            if (options.onStreamToken) {
              options.onStreamToken(token);
            }
          }
        }

        // Construct a ChatCompletion object from accumulated streaming data
        if (lastChunk) {
          const chatCompletion: ChatCompletion = {
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
              logprobs: null,
              finish_reason: lastChunk.choices?.[0]?.finish_reason || 'stop'
            }],
            usage: lastChunk.usage || {
              prompt_tokens: 0,
              completion_tokens: 0,
              total_tokens: 0,
              extra: {
                e2e_latency_s: 0,
                prefill_tokens_per_s: 0,
                decode_tokens_per_s: 0,
                time_to_first_token_s: 0,
                time_per_output_token_s: 0
              }
            }
          };

          // Track AI response
          analytics?.track('ai_response_received', {
            response_time_ms: Date.now() - responseStartTime,
            response_length: fullContent.length,
            feature_used: 'chat', // This will be overridden by calling code if needed
            streaming: isStreaming,
            page_url: window.location.href,
            page_domain: window.location.hostname,
          });

          return chatCompletion;
        } else {
          throw new Error("No chunks received from streaming response");
        }

      } else {
        // Non-streaming response
        const response = await this.engine.chat.completions.create({
          messages,
          response_format: { type: options.responseFormat || 'text' },
          stream: false
        }) as ChatCompletion;

        // Track AI response
        analytics?.track('ai_response_received', {
          response_time_ms: Date.now() - responseStartTime,
          response_length: response.choices[0]?.message?.content?.length || 0,
          feature_used: 'chat',
          streaming: isStreaming,
          page_url: window.location.href,
          page_domain: window.location.hostname,
        });

        return response;
      }
    } catch (error) {
      // Track errors
      analytics?.track('error_occurred', {
        error_type: 'chat_completion_error',
        error_message: error instanceof Error ? error.message : String(error),
        feature: 'chat',
        page_url: window.location.href,
        page_domain: window.location.hostname,
      });

      throw error;
    }
  }

  /**
   * Check if the engine is running on the main thread due to Safari detection
   * @returns {boolean} True if using main thread because of Safari
   */
  get isUsingMainThreadForSafari(): boolean {
    return isSafari() && this.useWorker && !this.worker;
  }

  /**
   * Get information about the current engine setup
   * @returns {object} Engine setup information
   */
  getEngineInfo() {
    return {
      browserName: getBrowserName(),
      isSafari: isSafari(),
      useWorker: this.useWorker,
      actuallyUsingWorker: !!this.worker,
      workerVerified: this.workerVerified,
      isMainThreadForSafari: this.isUsingMainThreadForSafari,
      modelLoading: this.isLoading
    };
  }
}