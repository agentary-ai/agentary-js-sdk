import { useState, useEffect } from 'preact/hooks';
import type { WebLLMClient } from '../../core/llm/WebLLMClient';
import type { WidgetOptions } from '../../types/index';
import { generatePrompts } from '../../prompts/index';
import { Logger } from '../../utils/Logger';

const DEFAULT_PROMPTS = [
  "What are the key takeaways from this article or webpage?",
  "Analyze the main arguments and evidence presented in this content",
  "Explain the difficult concepts on this page in simple terms",
  "What are the implications and practical applications of this information?",
  "How does this content relate to other topics I should know?"
];

interface UseContentPromptsOptions {
  webLLMClient: WebLLMClient;
  widgetOptions: WidgetOptions;
  isVisible: boolean;
  isClientReady: boolean;
}

export function useContentPrompts({ 
  webLLMClient, 
  widgetOptions, 
  isVisible, 
  isClientReady 
}: UseContentPromptsOptions) {
  const [contentPrompts, setContentPrompts] = useState<string[]>([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const logger = new Logger(false);

  // Generate prompts when popup becomes visible and model is loaded
  useEffect(() => {
    // Only generate prompts when:
    // 1. The popup is visible
    // 2. The model is **fully** ready (webLLMClient.isReady === true)
    // 3. We don't already have prompts
    if (isVisible && webLLMClient.isReady && contentPrompts.length === 0) {
      logger.info('Generating content prompts (model ready)', {
        isVisible,
        isClientReady,
        isReady: webLLMClient.isReady,
        existingPromptCount: contentPrompts.length
      });
      generateContentPrompts();
    }
  }, [isVisible, isClientReady, webLLMClient]);

  const generateContentPrompts = async () => {
    setIsGeneratingPrompts(true);
    setShowPrompts(false);
    setIsFadingOut(false);
    
    try {
      const options = {
        promptCount: widgetOptions.maxPagePrompts || 5,
        ...(widgetOptions.contentSelector && { contentSelector: widgetOptions.contentSelector })
      };

      logger.info('Generating content prompts with options:', options);

      const generatedPrompts = await generatePrompts(
        webLLMClient,
        options,
        logger
      );
      logger.debug('Generated content prompts:', generatedPrompts);
      setContentPrompts(generatedPrompts);
    } catch (error) {
      logger.error('Failed to generate content prompts:', error);
      setContentPrompts(DEFAULT_PROMPTS);
    } finally {
      // Start fade out of spinner, then fade in prompts
      setIsFadingOut(true);
      setTimeout(() => {
        setIsGeneratingPrompts(false);
        setShowPrompts(true);
      }, 300); // Match fade-out duration
    }
  };

  return {
    contentPrompts,
    isGeneratingPrompts,
    showPrompts,
    isFadingOut,
    regeneratePrompts: generateContentPrompts
  };
} 