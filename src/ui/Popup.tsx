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
    isFadingOut 
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

  // Inject styles when component mounts
  useEffect(() => {
    injectAgentaryStyles();
  }, []);

  useEffect(() => {
    logger.debug("isClientReady", isClientReady);
  }, [isClientReady]);

  const handleButtonClick = () => {
    const isLoading = !isClientReady || isLoadingRelatedArticles;
    handleToggle(isLoading, onClose);
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

  return (
    <div className={classNames.container}>
      {/* Popup Dialog */}
      {isVisible && isClientReady && !isLoadingRelatedArticles && !showChat && (
        <PopupDialog
          isClosing={isClosing || isDialogClosing}
          contentPrompts={contentPrompts}
          isGeneratingPrompts={isGeneratingPrompts}
          showPrompts={showPrompts}
          isFadingOut={isFadingOut}
          onStartChat={handleStartChat}
          relatedArticlesService={relatedArticlesService}
          widgetOptions={widgetOptions}
          relatedArticles={relatedArticles}
          isLoadingRelatedArticles={isLoadingRelatedArticles}
          showRelatedArticlesFadeIn={showRelatedArticlesFadeIn}
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
        isModelLoading={!isClientReady || isLoadingRelatedArticles}
        onClick={handleButtonClick}
      />
    </div>
  );
} 