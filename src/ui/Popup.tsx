import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import type { WebLLMClient } from '../core/WebLLMClient';
import type { WidgetOptions } from '../types/index';
import type { Logger } from '../utils/Logger';
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
  onClose?: () => void;
}

export function Popup({ webLLMClient, widgetOptions, logger, onClose }: PopupProps) {
  // Chat state management
  const [showChat, setShowChat] = useState(false);
  const [chatInitialMessage, setChatInitialMessage] = useState<string | undefined>();
  const [isChatClosing, setIsChatClosing] = useState(false);

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

  const handleButtonClick = () => {
    handleToggle(isModelLoading, onClose);
  };

  const handleStartChat = (initialMessage?: string) => {
    setChatInitialMessage(initialMessage);
    setShowChat(true);
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
      {/* Floating Action Button */}
      <FloatingActionButton
        isVisible={isVisible}
        isModelLoading={isModelLoading}
        onClick={handleButtonClick}
      />

      {/* Popup Dialog */}
      {isVisible && !isModelLoading && !showChat && (
        <PopupDialog
          isClosing={isClosing}
          contentPrompts={contentPrompts}
          isGeneratingPrompts={isGeneratingPrompts}
          showPrompts={showPrompts}
          isFadingOut={isFadingOut}
          onStartChat={handleStartChat}
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
    </div>
  );
} 