import { useState, useEffect, useCallback } from 'preact/hooks';
import type { WebLLMClient } from '../../core/llm/WebLLMClient';
import type { Logger } from '../../utils/Logger';

interface UsePageSummaryOptions {
  webLLMClient: WebLLMClient;
  isVisible: boolean;
  isClientReady: boolean;
  logger: Logger;
}

export function usePageSummary({ 
  webLLMClient, 
  isVisible, 
  isClientReady,
  logger
}: UsePageSummaryOptions) {
  const [summary, setSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [hasSummaryGenerated, setHasSummaryGenerated] = useState(false);

  const generateSummary = useCallback(async () => {
    if (!webLLMClient?.isReady || hasSummaryGenerated) return;

    setIsGeneratingSummary(true);
    setSummaryError(null);
    setSummary('');
    setShowSummary(false);

    try {
      logger.debug('Starting page summary generation');
      
      // Import the summarizeContent function
      const { summarizeContent } = await import('../../summarize/index');
      
      let streamedContent = '';
      
      await summarizeContent(
        webLLMClient,
        {
          streamResponse: true,
          onStreamToken: (token: string) => {
            streamedContent += token;
            setSummary(streamedContent);
            
            // Show the summary container on first token
            if (!showSummary && streamedContent.length > 0) {
              setShowSummary(true);
            }
          }
        },
        logger
      );

      logger.debug('Page summary generation completed');
      setHasSummaryGenerated(true);
    } catch (error) {
      logger.error('Error generating page summary:', error);
      setSummaryError(error instanceof Error ? error.message : 'Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  }, [webLLMClient, logger, hasSummaryGenerated]);

  // Generate summary when LLM client is ready
  useEffect(() => {
    // Only generate summary when:
    // 1. The client is fully ready
    // 2. We haven't already generated a summary
    if (webLLMClient?.isReady && !hasSummaryGenerated && !isGeneratingSummary && !summaryError) {
      logger.info('Generating page summary (model ready)', {
        isVisible,
        isClientReady,
        isReady: webLLMClient.isReady,
        hasSummaryGenerated
      });
      generateSummary();
    }
  }, [isClientReady, webLLMClient?.isReady, hasSummaryGenerated, isGeneratingSummary, summaryError, generateSummary, logger]);

  // Handle visibility state changes
  useEffect(() => {
    if (!isVisible && showSummary) {
      // Hide when popup closes (but keep the summary content)
      setShowSummary(false);
    } else if (isVisible && hasSummaryGenerated && summary && !showSummary) {
      // Show with fade-in when popup reopens and we have a summary
      setTimeout(() => {
        setShowSummary(true);
      }, 50);
    }
  }, [isVisible, showSummary, hasSummaryGenerated, summary]);

  return {
    summary,
    isGeneratingSummary,
    summaryError,
    showSummary,
    regenerateSummary: generateSummary
  };
} 