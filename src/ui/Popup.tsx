import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import type { WebLLMClient } from '../core/WebLLMClient';
import type { WidgetOptions } from '../types/index';
import { classNames, injectAgentaryStyles } from './styles';

interface PopupProps {
  webLLMClient: WebLLMClient;
  widgetOptions: WidgetOptions;
  onClose?: () => void;
}

export function Popup({ webLLMClient, widgetOptions, onClose }: PopupProps) {
  const [isVisible, setIsVisible] = useState(widgetOptions.autoOpenOnLoad || false);
  const [isModelLoading, setIsModelLoading] = useState(webLLMClient.modelLoading);
  const [isClosing, setIsClosing] = useState(false);

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
      {(!isVisible || isModelLoading) && (
        <button
          onClick={handleToggle}
          disabled={isModelLoading}
          className={classNames.floatingButton}
          title={isModelLoading ? "Loading model..." : "Open Agentary"}
        >
          {isModelLoading ? (
            <i className={`fas fa-spinner ${classNames.spinner}`}></i>
          ) : (
            <i className="fas fa-robot"></i>
          )}
        </button>
      )}

      {/* Popup Dialog */}
      {isVisible && !isModelLoading && (
        <div className={getPopupClassName()}>
          {/* Header */}
          <div className={classNames.header}>
            <div className={classNames.headerContent}>
              <h3 className={classNames.headerTitle}>
                Agentary
              </h3>
            </div>
            <button
              onClick={handleClose}
              className={classNames.closeButton}
              title="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Content */}
          <div className={classNames.content}>
            <div className={classNames.questionInputContainer}>
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