import { CreateMLCEngine, CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";

export class WebLLMClient {
  constructor(
    modelPath = "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    initProgressCallback = (p) => {
      console.log(p);
    },
    useWorker = true,
  ) {
    this.modelPath = modelPath;
    this.initProgressCallback = initProgressCallback;
    this.useWorker = useWorker;
    this.engine = null;
    this.worker = null;
    this.isModelLoading = false;
    this.modelLoadingProgress = 0;
    this.onModelLoadingChange = undefined;
    this.workerVerified = false;
    this.workerBlobUrl = null;
    this.workerCreationStrategy = null;
  }

  setModelLoadingCallback(callback) {
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
    this.workerCreationStrategy = null;
  }

  /**
   * Create a worker using blob URL strategy (CORS-safe)
   * @returns {Promise<Worker|null>} Created worker or null
   */
  async createWorker() {
    try {
      console.log("Creating worker with blob URL strategy...");
      const workerUrl = new URL('./webllm-worker.js', import.meta.url);
      
      // Fetch the worker code
      const response = await fetch(workerUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch worker: ${response.status} ${response.statusText}`);
      }
      
      const workerCode = await response.text();
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      
      console.log("Worker blob URL created:", blobUrl);
      const worker = new Worker(blobUrl);
      
      // Store blob URL for cleanup
      this.workerBlobUrl = blobUrl;
      this.workerCreationStrategy = 'blob';
      
      console.log("✅ Worker created successfully with blob URL strategy");
      return worker;
      
    } catch (error) {
      console.error("Failed to create worker:", error);
      return null;
    }
  }

  /**
   * Verify worker creation and communication
   * @param {Worker} worker - The worker to verify
   * @returns {Promise<boolean>} - True if worker is verified
   */
  async verifyWorker(worker) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.warn("Worker verification timeout");
        resolve(false);
      }, 5000);

      if (!worker) {
        console.error("Worker is null or undefined");
        clearTimeout(timeout);
        resolve(false);
        return;
      }

      console.log("Verifying worker communication...");

      const testMessage = { type: 'ping', timestamp: Date.now() };
      
      const messageHandler = (event) => {
        console.log("Worker verification - received:", event.data);
        if (event.data && (event.data.type === 'pong' || event.data.type === 'echo')) {
          worker.removeEventListener('message', messageHandler);
          worker.removeEventListener('error', errorHandler);
          clearTimeout(timeout);
          console.log("✅ Worker verification successful");
          resolve(true);
        }
      };

      const errorHandler = (error) => {
        console.error("Worker verification error:", error);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        clearTimeout(timeout);
        resolve(false);
      };

      worker.addEventListener('message', messageHandler);
      worker.addEventListener('error', errorHandler);

      try {
        worker.postMessage(testMessage);
        console.log("Worker verification - test message sent");
      } catch (error) {
        console.error("Failed to send verification message:", error);
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
        this.modelLoadingProgress = 0;
        
        if (this.useWorker) {
          try {
            console.log("Attempting to create web worker engine");
            
            // Create worker using blob URL strategy
            const worker = await this.createWorker();
            
            if (!worker) {
              throw new Error('Failed to create worker');
            }

            console.log("Worker created successfully: ", worker);

            // Verify the worker
            this.workerVerified = await this.verifyWorker(worker);
            if (!this.workerVerified) {
              worker.terminate();
              throw new Error('Worker verification failed');
            }

            this.worker = worker;

            console.log("Creating web worker engine from verified worker");
            this.engine = await CreateWebWorkerMLCEngine(
              this.worker,
              this.modelPath,
              {
                initProgressCallback: this.initProgressCallback
              }
            );
            console.log("✅ Web worker engine created successfully");
          } catch (workerError) {
            console.warn("Failed to create web worker engine, falling back to main thread:", workerError);
            // Clean up any partially created worker
            this.cleanup();
            // Fall back to main thread engine
            this.engine = await CreateMLCEngine(this.modelPath, {
              initProgressCallback: this.initProgressCallback
            });
            console.log("✅ Main thread engine created successfully");
          }
        } else {
          console.log("Creating main thread engine (worker disabled)");
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
        this.modelLoadingProgress = 1;
      }
    }
  }

  /**
   * Get worker status information
   * @returns {Object} Worker status details
   */
  getWorkerStatus() {
    return {
      hasWorker: !!this.worker,
      workerVerified: this.workerVerified,
      useWorker: this.useWorker,
      workerType: this.worker ? this.worker.constructor.name : null,
      workerCreationStrategy: this.workerCreationStrategy,
      hasBlobUrl: !!this.workerBlobUrl,
      blobUrl: this.workerBlobUrl
    };
  }

  async chatCompletion(
    messages,
    options
  ) {
    await this.createEngine();
    if (options.stream) {
      return this.streamingChatCompletion(messages, options);
    }
    return this.engine.chat.completions.create({
      messages,
      temperature: options.temperature,
      response_format: options.response_format
    });
  }

  async streamingChatCompletion(
    messages,
    options = {}
  ) {
    await this.createEngine();
    return this.engine.chat.completions.create({
      messages,
      temperature: options.temperature,
      stream: true,
      stream_options: options.stream_options
    });
  }
}