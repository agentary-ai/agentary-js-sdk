import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { WebLLMClient } from '../core/llm/WebLLMClient';
import type { WidgetOptions } from '../types/index';
import type { Logger } from '../utils/Logger';
import type { RelatedArticlesService } from '../core/services/RelatedArticlesService';
import { classNames, injectAgentaryStyles } from './styles';
import { useLLMClientState } from './hooks/useLLMClientState';
import { usePopupState } from './hooks/usePopupState';
import { useContentPrompts } from './hooks/useContentPrompts';
import { useRelatedArticles } from './hooks/useRelatedArticles';
import { usePageSummary } from './hooks/usePageSummary';
import { FloatingActionButton } from './components/FloatingActionButton';
import { PopupDialog } from './components/PopupDialog';
import { ChatInterface } from './components/ChatInterface';

interface PopupProps {
  webLLMClient: WebLLMClient;
  widgetOptions: WidgetOptions;
  logger: Logger;
  relatedArticlesService?: RelatedArticlesService | undefined;
  onClose?: () => void;
}

export function Popup({ webLLMClient, widgetOptions, logger, relatedArticlesService, onClose }: PopupProps) {
  // Chat state management
  const [showChat, setShowChat] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();
  const [isChatClosing, setIsChatClosing] = useState(false);
  const [isDialogClosing, setIsDialogClosing] = useState(false);

  // Custom hooks for state management
  const { isClientReady } = useLLMClientState(webLLMClient);
  const { isVisible, isClosing, handleToggle } = usePopupState(widgetOptions.autoOpenOnLoad);

  const { 
    contentPrompts, 
    isGeneratingPrompts, 
    showPrompts, 
    isFadingOut,
    regeneratePrompts
  } = useContentPrompts({ 
    webLLMClient, 
    widgetOptions, 
    isVisible, 
    isClientReady 
  });

  const {
    relatedArticles,
    isLoading: isLoadingRelatedArticles,
    showFadeIn: showRelatedArticlesFadeIn,
    hasFetched: hasRelatedArticlesFetched
  } = useRelatedArticles({
    relatedArticlesService,
    widgetOptions,
    isVisible,
    isClientReady
  });

  const {
    summary,
    isGeneratingSummary,
    summaryError,
    showSummary
  } = usePageSummary({
    webLLMClient,
    isVisible,
    isClientReady,
    logger
  });

  // Inject styles when component mounts
  useEffect(() => {
    injectAgentaryStyles();
  }, []);

  useEffect(() => {
    logger.debug("isClientReady", isClientReady);
  }, [isClientReady]);

  const handleButtonClick = async () => {
    const isLoading = !isClientReady || isLoadingRelatedArticles;
    
    // If chat is open, we need to stop generation and close chat first
    if (showChat && isVisible) {
      try {
        // Stop any ongoing generation
        await webLLMClient.interruptGenerate();
      } catch (error) {
        logger.error('Error stopping generation:', error);
      }
      
      // Close the chat interface
      handleCloseChat();
      
      // Then close the entire popup
      setTimeout(() => {
        handleToggle(isLoading, onClose);
      }, 300); // Wait for chat close animation
    } else {
      // Normal toggle behavior when chat is not open
      handleToggle(isLoading, onClose);
    }
  };

  const handleStartChat = (initialMessage?: string) => {
    setChatInitialMessage(initialMessage);
    setIsDialogClosing(true);
    setTimeout(() => {
      setShowChat(true);
      setIsDialogClosing(false); // Reset for next time
    }, 300); // Match animation duration
  };

  const handleCloseChat = () => {
    setIsChatClosing(true);
    setTimeout(() => {
      setShowChat(false);
      setIsChatClosing(false);
      setChatInitialMessage(undefined);
    }, 300); // Match animation duration
  };

  // Calculate if everything is ready and loaded
  const isContentReady = isClientReady && 
    !isGeneratingPrompts && 
    !isLoadingRelatedArticles && 
    !isGeneratingSummary &&
    (contentPrompts.length > 0 || showPrompts);

  // Check if model is loading
  const isModelLoading = !isClientReady || isLoadingRelatedArticles || isGeneratingSummary || isGeneratingPrompts;

  return (
    <div className={classNames.container}>
      {/* Black Overlay - single overlay for both popup dialog and chat interface */}
      {(isVisible || showChat) && !isModelLoading && (
        <div className={`${classNames.overlay} ${(isClosing || isChatClosing) ? classNames.fadeOut : classNames.fadeIn}`} />
      )}

      {/* Popup Dialog */}
      {isVisible && (isClientReady && !isLoadingRelatedArticles && !isGeneratingSummary && !isGeneratingPrompts) && !showChat && (
        <PopupDialog
          isClosing={isClosing || isDialogClosing}
          contentPrompts={contentPrompts}
          isGeneratingPrompts={isGeneratingPrompts}
          showPrompts={showPrompts}
          isFadingOut={isFadingOut}
          onStartChat={handleStartChat}
          onRefreshPrompts={regeneratePrompts}
          relatedArticlesService={relatedArticlesService}
          widgetOptions={widgetOptions}
          relatedArticles={relatedArticles}
          isLoadingRelatedArticles={isLoadingRelatedArticles}
          showRelatedArticlesFadeIn={showRelatedArticlesFadeIn}
          webLLMClient={webLLMClient}
          logger={logger}
          summary={summary}
          isGeneratingSummary={isGeneratingSummary}
          summaryError={summaryError}
          showSummary={showSummary}
        />
      )}

      {/* Chat Interface */}
      {showChat && (
        <ChatInterface
          isClosing={isChatClosing}
          initialMessage={chatInitialMessage}
          onClose={handleCloseChat}
          webLLMClient={webLLMClient}
          logger={logger}
        />
      )}

      {/* Floating Action Button (rendered last to ensure it stays on top) */}
      <FloatingActionButton
        isVisible={isVisible}
        isModelLoading={isModelLoading}
        isReady={isContentReady}
        onClick={handleButtonClick}
      />
    </div>
  );
} 