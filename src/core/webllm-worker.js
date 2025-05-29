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