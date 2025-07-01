import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { WebLLMClient } from '../core/llm/WebLLMClient';
import type { WidgetOptions } from '../types/index';
import type { Logger } from '../utils/Logger';
import type { RelatedArticlesService } from '../core/services/RelatedArticlesService';
import { classNames, injectAgentaryStyles } from './styles';
import { useModelState } from './hooks/useModelState';
import { usePopupState } from './hooks/usePopupState';
import { useContentPrompts } from './hooks/useContentPrompts';
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
  const { isModelLoading } = useModelState(webLLMClient);
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
    isModelLoading 
  });

  // Inject styles when component mounts
  useEffect(() => {
    injectAgentaryStyles();
  }, []);

  useEffect(() => {
    logger.debug("isModelLoading", isModelLoading);
  }, [isModelLoading]);

  const handleButtonClick = () => {
    handleToggle(isModelLoading, onClose);
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
      {isVisible && !isModelLoading && !showChat && (
        <PopupDialog
          isClosing={isClosing || isDialogClosing}
          contentPrompts={contentPrompts}
          isGeneratingPrompts={isGeneratingPrompts}
          showPrompts={showPrompts}
          isFadingOut={isFadingOut}
          onStartChat={handleStartChat}
          relatedArticlesService={relatedArticlesService}
          widgetOptions={widgetOptions}
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
        onClick={handleButtonClick}
      />
    </div>
  );
} 