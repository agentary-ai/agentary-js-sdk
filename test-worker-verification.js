// Worker Verification Test Script
// Copy and paste this into your browser console to test worker creation

(function() {
  console.log("🔧 Starting Worker Verification Tests...");

  // Test 1: Basic Worker Creation
  async function testBasicWorkerCreation() {
    console.log("\n📋 Test 1: Basic Worker Creation");
    
    try {
      // Try different worker creation methods
      const workerTests = [
        {
          name: "Module Worker (import.meta.url)",
          create: () => new Worker(import.meta.url, { type: 'module' })
        },
        {
          name: "Module Worker (blob URL)",
          create: () => {
            const blob = new Blob([`
              console.log("Worker started");
              self.onmessage = function(e) {
                console.log("Worker received:", e.data);
                self.postMessage({type: 'pong', data: e.data});
              };
            `], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            return new Worker(url, { type: 'module' });
          }
        },
        {
          name: "Regular Worker (blob URL)",
          create: () => {
            const blob = new Blob([`
              console.log("Regular worker started");
              self.onmessage = function(e) {
                console.log("Regular worker received:", e.data);
                self.postMessage({type: 'pong', data: e.data});
              };
            `], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            return new Worker(url);
          }
        }
      ];

      for (const test of workerTests) {
        try {
          console.log(`  Testing: ${test.name}`);
          const worker = test.create();
          
          if (worker) {
            console.log(`  ✅ ${test.name} - Worker created successfully`);
            console.log(`     - Constructor: ${worker.constructor.name}`);
            console.log(`     - Prototype: ${Object.getPrototypeOf(worker).constructor.name}`);
            
            // Test communication
            const communicationResult = await testWorkerCommunication(worker, test.name);
            if (communicationResult) {
              console.log(`  ✅ ${test.name} - Communication successful`);
            } else {
              console.log(`  ❌ ${test.name} - Communication failed`);
            }
            
            worker.terminate();
          } else {
            console.log(`  ❌ ${test.name} - Worker is null/undefined`);
          }
        } catch (error) {
          console.log(`  ❌ ${test.name} - Error: ${error.message}`);
        }
      }
    } catch (error) {
      console.error("Test 1 failed:", error);
    }
  }

  // Test 2: Worker Communication
  function testWorkerCommunication(worker, testName) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log(`    ⏰ ${testName} - Communication timeout`);
        resolve(false);
      }, 3000);

      const messageHandler = (event) => {
        console.log(`    📨 ${testName} - Received:`, event.data);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        clearTimeout(timeout);
        resolve(true);
      };

      const errorHandler = (error) => {
        console.log(`    ❌ ${testName} - Communication error:`, error);
        worker.removeEventListener('message', messageHandler);
        worker.removeEventListener('error', errorHandler);
        clearTimeout(timeout);
        resolve(false);
      };

      worker.addEventListener('message', messageHandler);
      worker.addEventListener('error', errorHandler);

      try {
        worker.postMessage({ type: 'ping', timestamp: Date.now() });
        console.log(`    📤 ${testName} - Message sent`);
      } catch (error) {
        console.log(`    ❌ ${testName} - Failed to send message:`, error);
        clearTimeout(timeout);
        resolve(false);
      }
    });
  }

  // Test 3: Browser Environment Check
  function testBrowserEnvironment() {
    console.log("\n📋 Test 3: Browser Environment Check");
    
    const checks = [
      {
        name: "Worker Support",
        test: () => typeof Worker !== 'undefined',
        required: true
      },
      {
        name: "Module Worker Support",
        test: () => {
          try {
            const blob = new Blob([''], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const worker = new Worker(url, { type: 'module' });
            worker.terminate();
            URL.revokeObjectURL(url);
            return true;
          } catch {
            return false;
          }
        },
        required: false
      },
      {
        name: "Blob URL Support",
        test: () => typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function',
        required: true
      },
      {
        name: "import.meta Support",
        test: () => typeof import.meta !== 'undefined' && typeof import.meta.url === 'string',
        required: false
      },
      {
        name: "ES Modules Support",
        test: () => {
          try {
            new Function('import("")');
            return true;
          } catch {
            return false;
          }
        },
        required: false
      }
    ];

    checks.forEach(check => {
      try {
        const result = check.test();
        const status = result ? '✅' : (check.required ? '❌' : '⚠️');
        console.log(`  ${status} ${check.name}: ${result}`);
      } catch (error) {
        const status = check.required ? '❌' : '⚠️';
        console.log(`  ${status} ${check.name}: Error - ${error.message}`);
      }
    });
  }

  // Test 4: Agentary SDK Worker Test (if available)
  async function testAgentarySDKWorker() {
    console.log("\n📋 Test 4: Agentary SDK Worker Test");
    
    try {
      // Check if Agentary SDK is available
      if (typeof window.Agentary !== 'undefined' || typeof Agentary !== 'undefined') {
        console.log("  ✅ Agentary SDK detected");
        
        const AgentaryClass = window.Agentary?.AgentarySDK || Agentary?.AgentarySDK;
        if (AgentaryClass) {
          const sdk = new AgentaryClass({ loadModel: false });
          console.log("  ✅ SDK instance created");
          
          if (sdk.webLLMClient) {
            console.log("  ✅ WebLLM client available");
            
            // Test worker status
            const workerStatus = sdk.webLLMClient.getWorkerStatus();
            console.log("  📊 Worker Status:", workerStatus);
            
            // Try to create engine (this will test worker creation)
            try {
              console.log("  🔄 Testing engine creation...");
              await sdk.webLLMClient.createEngine();
              console.log("  ✅ Engine created successfully");
              
              const finalStatus = sdk.webLLMClient.getWorkerStatus();
              console.log("  📊 Final Worker Status:", finalStatus);
            } catch (error) {
              console.log("  ❌ Engine creation failed:", error.message);
            }
          } else {
            console.log("  ❌ WebLLM client not available");
          }
        } else {
          console.log("  ❌ AgentarySDK class not found");
        }
      } else {
        console.log("  ⚠️ Agentary SDK not loaded - skipping SDK-specific tests");
        console.log("  💡 Load the SDK first with:");
        console.log("     const script = document.createElement('script');");
        console.log("     script.src = 'path/to/agentary.umd.js';");
        console.log("     document.head.appendChild(script);");
      }
    } catch (error) {
      console.log("  ❌ SDK test failed:", error.message);
    }
  }

  // Test 5: Manual Worker Verification
  function testManualWorkerVerification() {
    console.log("\n📋 Test 5: Manual Worker Verification Methods");
    
    console.log("  📝 Manual verification methods you can use:");
    console.log("  1. Check browser DevTools:");
    console.log("     - Open DevTools → Sources → Check for worker threads");
    console.log("     - Look for 'Worker' entries in the threads panel");
    console.log("  ");
    console.log("  2. Console verification:");
    console.log("     const worker = new Worker('worker.js');");
    console.log("     console.log('Worker created:', !!worker);");
    console.log("     console.log('Worker type:', worker.constructor.name);");
    console.log("  ");
    console.log("  3. Communication test:");
    console.log("     worker.postMessage('test');");
    console.log("     worker.onmessage = (e) => console.log('Response:', e.data);");
    console.log("  ");
    console.log("  4. Error handling:");
    console.log("     worker.onerror = (e) => console.error('Worker error:', e);");
    console.log("  ");
    console.log("  5. Check worker status:");
    console.log("     // Worker is running if no errors and can receive messages");
  }

  // Run all tests
  async function runAllTests() {
    console.log("🚀 Running Worker Verification Test Suite");
    console.log("==========================================");
    
    testBrowserEnvironment();
    await testBasicWorkerCreation();
    await testAgentarySDKWorker();
    testManualWorkerVerification();
    
    console.log("\n✅ Worker verification tests completed!");
    console.log("Check the results above to verify worker creation success.");
  }

  // Start tests
  runAllTests().catch(error => {
    console.error("Test suite failed:", error);
  });

})(); 