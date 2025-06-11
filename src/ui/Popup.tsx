import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import type { WebLLMClient } from '../core/WebLLMClient';
import type { WidgetOptions } from '../types/index';
import { classNames, injectAgentaryStyles } from './styles';
import { useModelState } from './hooks/useModelState';
import { usePopupState } from './hooks/usePopupState';
import { useContentPrompts } from './hooks/useContentPrompts';
import { FloatingActionButton } from './components/FloatingActionButton';
import { PopupDialog } from './components/PopupDialog';

interface PopupProps {
  webLLMClient: WebLLMClient;
  widgetOptions: WidgetOptions;
  onClose?: () => void;
}

export function Popup({ webLLMClient, widgetOptions, onClose }: PopupProps) {
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

  return (
    <div className={classNames.container}>
      {/* Floating Action Button */}
      <FloatingActionButton
        isVisible={isVisible}
        isModelLoading={isModelLoading}
        onClick={handleButtonClick}
      />

      {/* Popup Dialog */}
      {isVisible && !isModelLoading && (
        <PopupDialog
          isClosing={isClosing}
          contentPrompts={contentPrompts}
          isGeneratingPrompts={isGeneratingPrompts}
          showPrompts={showPrompts}
          isFadingOut={isFadingOut}
        />
      )}
    </div>
  );
} 