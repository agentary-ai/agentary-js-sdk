import { CreateMLCEngine, CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import type { ChatCompletion, ChatCompletionChunk, ChatCompletionMessageParam, InitProgressCallback, InitProgressReport, MLCEngine, ResponseFormat, WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { Logger } from "../utils/Logger";

interface ChatCompletionOptions {
  stream: boolean;
  responseFormat?: 'text' | 'json_object';
  onStreamToken?: (token: string) => void;
}

export class WebLLMClient {
  private logger: Logger;
  private modelPath: string;
  private initProgressCallback: InitProgressCallback;
  private useWorker: boolean;
  private engine?: WebWorkerMLCEngine | MLCEngine | null;
  private worker?: Worker | null;
  private workerVerified?: boolean;
  private workerBlobUrl?: string | null;
  private isModelLoading?: boolean;
  private onModelLoadingChange?: (isLoading: boolean) => void

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
      
      const workerCode = await response.text();
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

  async createEngine() {
    if (!this.engine) {
      try {
        if (this.onModelLoadingChange) {
          this.onModelLoadingChange(true);
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
            }, {
              context_window_size: 8192
            });
            this.logger.debug("Main thread engine created successfully");
          }
        } else {
          this.logger.debug("Creating main thread engine (worker disabled)");
          this.engine = await CreateMLCEngine(this.modelPath, {
            initProgressCallback: this.initProgressCallback
          });
        }
      } catch (error) {
        console.error("Error creating engine:", error);
        throw error;
      } finally {
        if (this.onModelLoadingChange) {
          this.onModelLoadingChange(false);
        }
        this.isModelLoading = false;
      }
    }
  }

  async chatCompletion(
    messages: ChatCompletionMessageParam[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletion | ChatCompletionChunk | null> {
    if (!this.engine) {
      throw new Error("Engine not created");
    }

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

      return lastChunk;

    } else {
      // Non-streaming response
      const response = await this.engine.chat.completions.create({
        messages,
        response_format: { type: options.responseFormat || 'text' },
        stream: false
      }) as ChatCompletion;
      return response;
    }
  }
}