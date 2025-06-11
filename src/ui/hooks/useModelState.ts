import { useState, useEffect } from 'preact/hooks';
import type { WebLLMClient } from '../../core/WebLLMClient';

export function useModelState(webLLMClient: WebLLMClient) {
  const [isModelLoading, setIsModelLoading] = useState(webLLMClient.modelLoading);

  useEffect(() => {
    webLLMClient.setOnModelLoadingChange((loading: boolean) => {
      setIsModelLoading(loading);
    });
    // Initial state
    setIsModelLoading(webLLMClient.modelLoading);
  }, [webLLMClient]);

  return { isModelLoading };
} 