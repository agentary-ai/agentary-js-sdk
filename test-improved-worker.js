// Improved Worker Verification Test
// Copy and paste this into your browser console

(function() {
  console.log("🔧 Testing Improved Worker Creation...");

  // Test the improved worker creation strategies
  async function testImprovedWorkerCreation() {
    console.log("\n📋 Testing Blob URL Worker Strategies");

    // Strategy 1: Module Worker with Blob URL
    try {
      console.log("Testing: Module Worker with Blob URL");
      
      const workerCode = `
        console.log("Module worker started");
        
        self.onmessage = (msg) => {
          console.log("Module worker received:", msg.data);
          if (msg.data && msg.data.type === 'ping') {
            self.postMessage({ 
              type: 'pong', 
              timestamp: Date.now(),
              originalTimestamp: msg.data.timestamp 
            });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      
      const worker = new Worker(blobUrl, { type: 'module' });
      console.log("✅ Module worker created with blob URL");
      
      // Test communication
      const result = await testWorkerCommunication(worker, "Module Worker");
      if (result) {
        console.log("✅ Module worker communication successful");
      } else {
        console.log("❌ Module worker communication failed");
      }
      
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.log("❌ Module worker failed:", error.message);
    }

    // Strategy 2: Regular Worker with Blob URL
    try {
      console.log("\nTesting: Regular Worker with Blob URL");
      
      const workerCode = `
        console.log("Regular worker started");
        
        self.onmessage = function(msg) {
          console.log("Regular worker received:", msg.data);
          if (msg.data && msg.data.type === 'ping') {
            self.postMessage({ 
              type: 'pong', 
              timestamp: Date.now(),
              originalTimestamp: msg.data.timestamp 
            });
          }
        };
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      
      const worker = new Worker(blobUrl);
      console.log("✅ Regular worker created with blob URL");
      
      // Test communication
      const result = await testWorkerCommunication(worker, "Regular Worker");
      if (result) {
        console.log("✅ Regular worker communication successful");
      } else {
        console.log("❌ Regular worker communication failed");
      }
      
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
      
    } catch (error) {
      console.log("❌ Regular worker failed:", error.message);
    }
  }

  // Test worker communication
  function testWorkerCommunication(worker, testName) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log(`⏰ ${testName} - Communication timeout`);
        resolve(false);
      }, 3000);

      const messageHandler = (event) => {
        console.log(`📨 ${testName} - Received:`, event.data);
        if (event.data && event.data.type === 'pong') {
          worker.removeEventListener('message', messageHandler);
          worker.removeEventListener('error', errorHandler);
          clearTimeout(timeout);
          resolve(true);
        }
      };

      const errorHandler = (error) => {
        console.log(`❌ ${testName} - Communication error:`, error);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        clearTimeout(timeout);
        resolve(false);
      };

      worker.addEventListener('message', messageHandler);
      worker.addEventListener('error', errorHandler);

      try {
        worker.postMessage({ type: 'ping', timestamp: Date.now() });
        console.log(`📤 ${testName} - Message sent`);
      } catch (error) {
        console.log(`❌ ${testName} - Failed to send message:`, error);
        clearTimeout(timeout);
        resolve(false);
      }
    });
  }

  // Test with Agentary SDK if available
  async function testWithAgentarySDK() {
    console.log("\n📋 Testing with Agentary SDK (if available)");
    
    try {
      if (typeof window.Agentary !== 'undefined' || typeof Agentary !== 'undefined') {
        console.log("✅ Agentary SDK detected");
        
        const AgentaryClass = window.Agentary?.AgentarySDK || Agentary?.AgentarySDK;
        if (AgentaryClass) {
          console.log("🔄 Creating SDK instance...");
          const sdk = new AgentaryClass({ loadModel: false });
          
          console.log("📊 Initial worker status:", sdk.webLLMClient.getWorkerStatus());
          
          console.log("🔄 Testing engine creation with improved worker...");
          await sdk.webLLMClient.createEngine();
          
          console.log("📊 Final worker status:", sdk.webLLMClient.getWorkerStatus());
          console.log("✅ SDK test completed successfully!");
          
        } else {
          console.log("❌ AgentarySDK class not found");
        }
      } else {
        console.log("⚠️ Agentary SDK not loaded");
        console.log("💡 Load it first with:");
        console.log("   const script = document.createElement('script');");
        console.log("   script.src = 'https://unpkg.com/agentary-js-sdk/dist/agentary.umd.js';");
        console.log("   document.head.appendChild(script);");
      }
    } catch (error) {
      console.log("❌ SDK test failed:", error.message);
      console.log("📊 Error details:", error);
    }
  }

  // Run tests
  async function runTests() {
    console.log("🚀 Running Improved Worker Tests");
    console.log("=================================");
    
    await testImprovedWorkerCreation();
    await testWithAgentarySDK();
    
    console.log("\n✅ All tests completed!");
    console.log("The improved worker creation should now work better with fallback strategies.");
  }

  runTests().catch(error => {
    console.error("Test failed:", error);
  });

})(); 