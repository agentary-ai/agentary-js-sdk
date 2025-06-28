import { useState, useEffect } from 'preact/hooks';
import type { WebLLMClient } from '../../core/llm/WebLLMClient';

export function useModelState(webLLMClient: WebLLMClient) {
  const [isModelLoading, setIsModelLoading] = useState(webLLMClient.isLoading);

  useEffect(() => {
    webLLMClient.setOnModelLoadingChange((loading: boolean) => {
      setIsModelLoading(loading);
    });
    // Initial state
    setIsModelLoading(webLLMClient.isLoading);
  }, [webLLMClient]);

  return { isModelLoading };
} 