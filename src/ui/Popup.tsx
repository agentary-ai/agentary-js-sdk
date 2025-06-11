import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { WebLLMClient } from '../core/WebLLMClient';
import type { WidgetOptions } from '../types/index';
import { classNames, injectAgentaryStyles } from './styles';
import { generatePrompts } from '../prompts/index';
import { Logger } from '../utils/Logger';

interface PopupProps {
  webLLMClient: WebLLMClient;
  widgetOptions: WidgetOptions;
  onClose?: () => void;
}

export function Popup({ webLLMClient, widgetOptions, onClose }: PopupProps) {
  const [isVisible, setIsVisible] = useState(widgetOptions.autoOpenOnLoad || false);
  const [isModelLoading, setIsModelLoading] = useState(webLLMClient.modelLoading);
  const [isClosing, setIsClosing] = useState(false);
  const [isContentPromptsExpanded, setIsContentPromptsExpanded] = useState(false);
  const [contentPrompts, setContentPrompts] = useState<string[]>([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Create logger instance for generatePrompts
  const logger = new Logger(false); // You might want to make this configurable

  // Inject styles when component mounts
  useEffect(() => {
    injectAgentaryStyles();
  }, []);

  // Set up model loading state listener
  useEffect(() => {
    webLLMClient.setOnModelLoadingChange((loading: boolean) => {
      setIsModelLoading(loading);
    });
    // Initial state
    setIsModelLoading(webLLMClient.modelLoading);
  }, [webLLMClient]);

  // Generate prompts when popup becomes visible and model is loaded
  useEffect(() => {
    if (isVisible && !isModelLoading && contentPrompts.length === 0) {
      generateContentPrompts();
    }
  }, [isVisible, isModelLoading]);

  const generateContentPrompts = async () => {
    setIsGeneratingPrompts(true);
    setShowPrompts(false);
    setIsFadingOut(false);
    
    try {
      const options: any = {
        promptCount: widgetOptions.maxPagePrompts || 5
      };
      if (widgetOptions.contentSelector) {
        options.contentSelector = widgetOptions.contentSelector;
      }
      
      const generatedPrompts = await generatePrompts(
        webLLMClient,
        options,
        logger
      );
      setContentPrompts(generatedPrompts);
    } catch (error) {
      logger.error('Failed to generate content prompts:', error);
      // Fallback to default prompts on error
      setContentPrompts([
        "What are the key takeaways from this article or webpage?",
        "Analyze the main arguments and evidence presented in this content",
        "Explain the difficult concepts on this page in simple terms",
        "What are the implications and practical applications of this information?",
        "How does this content relate to other topics I should know?"
      ]);
    } finally {
      // Start fade out of spinner, then fade in prompts
      setIsFadingOut(true);
      setTimeout(() => {
        setIsGeneratingPrompts(false);
        setShowPrompts(true);
      }, 300); // Match fade-out duration
    }
  };

  const handleToggle = () => {
    if (!isModelLoading) {
      if (isVisible) {
        handleClose();
      } else {
        setIsVisible(true);
        setIsClosing(false);
      }
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose?.();
    }, 300); // Match animation duration
  };

  const getPopupClassName = () => {
    const classes = [classNames.popup];
    if (isClosing) {
      classes.push(classNames.slideOut);
    } else {
      classes.push(classNames.slideIn);
    }
    return classes.join(' ');
  };

  return (
    <div className={classNames.container}>
      {/* Floating Action Button */}
      {!isModelLoading && (
        <button
          onClick={handleToggle}
          disabled={isModelLoading}
          className={classNames.floatingButton}
          title={isVisible ? "Close Agentary" : "Open Agentary"}
        >
          <i className={`fas fa-${isVisible ? 'times' : 'wand-magic-sparkles'}`}></i>
        </button>
      )}
      
      {/* Loading Button */}
      {isModelLoading && (
        <button
          disabled={true}
          className={classNames.floatingButton}
          title="Loading model..."
        >
          <i className={`fas fa-spinner ${classNames.spinner}`}></i>
        </button>
      )}

      {/* Popup Dialog */}
      {isVisible && !isModelLoading && (
        <div className={getPopupClassName()}>
          {/* Header */}
          {/* <div className={classNames.header}>
            <button
              onClick={handleClose}
              className={classNames.closeButton}
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div> */}

          {/* Content */}
          <div className={classNames.content}>
            <div className={classNames.questionInputContainer}>
              <div className={classNames.inputRow}>
                <input
                  type="text"
                  placeholder="What do you want to know?"
                  className={classNames.questionInput}
                />
                <button
                  className={classNames.sendButton}
                  title="Send message"
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
              
              {/* Content-specific learning prompts */}
              <div className={classNames.contentPromptSection}>
                {isGeneratingPrompts && (
                  <div 
                    className={isFadingOut ? classNames.fadeOut : ''}
                    style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}
                  >
                    <i className={`fas fa-spinner ${classNames.spinner}`}></i>
                  </div>
                )}
                
                {showPrompts && (
                  <div className={classNames.fadeIn}>
                    <div className={classNames.promptPillsContainer}>
                      {contentPrompts.slice(0, 2).map((prompt, index) => (
                        <div key={index} className={classNames.contentPromptPill}>
                          {prompt}
                        </div>
                      ))}
                      
                      {/* Expandable additional prompts */}
                      {contentPrompts.length > 2 && (
                        <div className={`${classNames.expandablePrompts} ${isContentPromptsExpanded ? classNames.expanded : ''}`}>
                          {contentPrompts.slice(2).map((prompt, index) => (
                            <div key={index + 2} className={classNames.contentPromptPill}>
                              {prompt}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    {contentPrompts.length > 2 && (
                      <button
                        className={classNames.contentPromptToggle}
                        onClick={() => setIsContentPromptsExpanded(!isContentPromptsExpanded)}
                      >
                        <i className={`fas fa-chevron-${isContentPromptsExpanded ? 'up' : 'down'}`}></i>
                        {isContentPromptsExpanded ? 'Show less' : `Show ${contentPrompts.length - 2} more`}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* General action prompts */}
            <div className={classNames.promptPillsContainer}>
              <div className={classNames.promptPill}>
                <i className="fas fa-book-open-reader"></i>
                Summarize this page
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={classNames.footer}>
            Powered by Agentary
          </div>
        </div>
      )}
    </div>
  );
} 