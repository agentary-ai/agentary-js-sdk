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
   * Create a worker using multiple strategies
   * @returns {Promise<Worker|null>} Created worker or null
   */
  async createWorker() {
    const strategies = [
      // Strategy 1: Try relative URL (works when SDK and worker are same-origin)
      () => {
        console.log("Strategy 1: Attempting to create worker with relative URL...");
        const workerUrl = new URL('./webllm-worker.js', import.meta.url);
        console.log("Worker URL resolved to:", workerUrl.href);
        return new Worker(workerUrl);
      },
      
      // Strategy 2: Try fetching worker code and create blob URL (CORS-safe)
      async () => {
        console.log("Strategy 2: Attempting to create worker with blob URL...");
        const workerUrl = new URL('./webllm-worker.js', import.meta.url);
        
        try {
          const response = await fetch(workerUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch worker: ${response.status}`);
          }
          
          const workerCode = await response.text();
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          
          console.log("Worker blob URL created:", blobUrl);
          const worker = new Worker(blobUrl);
          
          // Store blob URL for cleanup
          this.workerBlobUrl = blobUrl;
          
          return worker;
        } catch (fetchError) {
          console.warn("Failed to fetch worker for blob creation:", fetchError);
          throw fetchError;
        }
      },
      
      // Strategy 3: Create inline worker (fallback for CORS issues)
      () => {
        console.log("Strategy 3: Creating inline worker as fallback...");
        
        // Inline worker code that imports the WebLLM handler
        const inlineWorkerCode = `
          import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";
          
          const handler = new WebWorkerMLCEngineHandler();
          
          self.onmessage = (msg) => {
            // Handle verification ping messages
            if (msg.data && msg.data.type === 'ping') {
              console.log("Worker received ping, sending pong");
              self.postMessage({ 
                type: 'pong', 
                timestamp: Date.now(),
                originalTimestamp: msg.data.timestamp 
              });
              return;
            }
            
            // Handle regular WebLLM messages
            handler.onmessage(msg);
          };
        `;
        
        const blob = new Blob([inlineWorkerCode], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        
        console.log("Inline worker blob URL created:", blobUrl);
        this.workerBlobUrl = blobUrl;
        
        return new Worker(blobUrl, { type: 'module' });
      }
    ];

    // Try each strategy in order
    for (let i = 0; i < strategies.length; i++) {
      try {
        const strategy = strategies[i];
        // Check if this is the async strategy (strategy 2)
        const worker = i === 1 ? await strategy() : strategy();
        
        if (worker) {
          console.log(`✅ Worker created successfully with strategy ${i + 1}`);
          this.workerCreationStrategy = i + 1;
          return worker;
        }
      } catch (error) {
        console.warn(`Strategy ${i + 1} failed:`, error);
        if (i === strategies.length - 1) {
          console.error("All worker creation strategies failed");
          return null;
        }
      }
    }
    
    return null;
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
      strategyNames: {
        1: 'Relative URL',
        2: 'Blob URL from fetch',
        3: 'Inline worker'
      },
      hasBlobUrl: !!this.workerBlobUrl,
      blobUrl: this.workerBlobUrl
    };
  }
}