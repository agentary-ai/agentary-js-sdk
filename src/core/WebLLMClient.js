import { CreateMLCEngine, CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";

export class WebLLMClient {
  constructor(
    modelPath = "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    initProgressCallback = (p) => {
      console.log(p);
    },
    useWorker = true,
    workerUrl = null
  ) {
    this.modelPath = modelPath;
    this.initProgressCallback = initProgressCallback;
    this.useWorker = useWorker;
    this.workerUrl = workerUrl;
    this.engine = null;
    this.worker = null;
    this.isModelLoading = false;
    this.modelLoadingProgress = 0;
    this.onModelLoadingChange = undefined;
    this.workerVerified = false;
  }

  setModelLoadingCallback(callback) {
    this.onModelLoadingChange = callback;
  }

  /**
   * Create a worker URL using different strategies
   * @returns {string} Worker URL
   */
  createWorkerUrl() {
    // Strategy 1: Use provided workerUrl
    if (this.workerUrl) {
      console.log("Using provided worker URL:", this.workerUrl);
      return this.workerUrl;
    }

    // Strategy 2: Try to detect built worker script
    const possibleWorkerUrls = [
      './dist/webllm-worker.js',
      './webllm-worker.js',
      '/dist/webllm-worker.js',
      '/webllm-worker.js'
    ];

    // Strategy 3: Create inline worker using blob URL
    console.log("Creating inline worker using blob URL");
    const workerCode = `
      // Inline WebLLM Worker
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

    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    console.log("Created blob worker URL:", blobUrl);
    return blobUrl;
  }

  /**
   * Create worker with fallback strategies
   * @returns {Worker|null} Created worker or null
   */
  async createWorkerWithFallback() {
    const strategies = [
      {
        name: "Blob URL Module Worker",
        create: () => {
          const workerUrl = this.createWorkerUrl();
          return new Worker(workerUrl, { type: 'module' });
        }
      },
      {
        name: "Blob URL Regular Worker", 
        create: () => {
          const workerCode = `
            // Simple worker without ES modules
            console.log("Simple worker started");
            
            self.onmessage = function(msg) {
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
              
              // For now, just echo back - WebLLM handler would go here
              console.log("Worker received message:", msg.data);
              self.postMessage({ type: 'echo', data: msg.data });
            };
          `;
          
          const blob = new Blob([workerCode], { type: 'application/javascript' });
          const blobUrl = URL.createObjectURL(blob);
          return new Worker(blobUrl);
        }
      }
    ];

    for (const strategy of strategies) {
      try {
        console.log(`Trying strategy: ${strategy.name}`);
        const worker = strategy.create();
        
        if (worker) {
          console.log(`✅ ${strategy.name} - Worker created`);
          
          // Verify the worker
          const verified = await this.verifyWorker(worker);
          if (verified) {
            console.log(`✅ ${strategy.name} - Worker verified`);
            return worker;
          } else {
            console.log(`❌ ${strategy.name} - Worker verification failed`);
            worker.terminate();
          }
        }
      } catch (error) {
        console.log(`❌ ${strategy.name} - Error: ${error.message}`);
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
      }, 5000); // 5 second timeout

      // Check if worker exists and has expected properties
      if (!worker) {
        console.error("Worker is null or undefined");
        clearTimeout(timeout);
        resolve(false);
        return;
      }

      // Check worker state
      console.log("Worker verification - checking properties:");
      console.log("- Worker object:", worker);
      console.log("- Worker constructor:", worker.constructor.name);
      console.log("- Worker prototype:", Object.getPrototypeOf(worker));

      // Test worker communication
      const testMessage = { type: 'ping', timestamp: Date.now() };
      
      const messageHandler = (event) => {
        console.log("Worker verification - received message:", event.data);
        if (event.data && (event.data.type === 'pong' || event.data.type === 'echo')) {
          worker.removeEventListener('message', messageHandler);
          worker.removeEventListener('error', errorHandler);
          clearTimeout(timeout);
          console.log("✅ Worker verification successful - communication established");
          resolve(true);
        }
      };

      const errorHandler = (error) => {
        console.error("Worker verification - error during communication test:", error);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        clearTimeout(timeout);
        resolve(false);
      };

      worker.addEventListener('message', messageHandler);
      worker.addEventListener('error', errorHandler);

      try {
        worker.postMessage(testMessage);
        console.log("Worker verification - test message sent:", testMessage);
      } catch (error) {
        console.error("Worker verification - failed to send test message:", error);
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
            
            // Create worker with fallback strategies
            const worker = await this.createWorkerWithFallback();
            
            if (!worker) {
              throw new Error('All worker creation strategies failed');
            }

            this.worker = worker;
            this.workerVerified = true;

            console.log("Creating web worker engine from verified worker: ", this.worker);
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
            if (this.worker) {
              this.worker.terminate();
              this.worker = null;
            }
            this.workerVerified = false;
            // Fall back to main thread engine
            this.engine = await CreateMLCEngine(this.modelPath, {
              initProgressCallback: this.initProgressCallback
            });
            console.log("✅ Main thread engine created successfully");
          }
        } else {
          console.log("Creating main thread engine (worker disabled or unavailable)");
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
      workerUrl: this.workerUrl,
      workerType: this.worker ? this.worker.constructor.name : null
    };
  }
}