import { useState, useEffect } from 'preact/hooks';
import type { WebLLMClient } from '../../core/llm/WebLLMClient';

export function useLLMClientState(webLLMClient: WebLLMClient) {
  const [isClientReady, setIsClientReady] = useState(webLLMClient.isReady);

  useEffect(() => {
    // Set up a listener for when the model ready state changes
    webLLMClient.setOnModelReadyChange((ready: boolean) => {
      setIsClientReady(ready);
    });
    // Initial state
    setIsClientReady(webLLMClient.isReady);
  }, [webLLMClient]);

  return { isClientReady };
} 