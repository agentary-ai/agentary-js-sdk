/**
 * Button component styles
 */
export const buttonStyles = `
  /* Floating Action Button Container */
  .agentary-floating-button-container {
    position: fixed;
    bottom: var(--agentary-spacing-xl);
    right: var(--agentary-spacing-xl);
    display: flex;
    align-items: center;
    gap: var(--agentary-spacing-md);
    z-index: var(--agentary-z-index);
    flex-direction: row;
  }

  /* Floating Action Button */
  .agentary-floating-button {
    position: relative;
    width: 60px;
    height: 60px;
    border-radius: var(--agentary-border-radius-button);
    background-color: var(--agentary-primary-color);
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: var(--agentary-shadow-light);
    font-size: var(--agentary-font-size-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform var(--agentary-transition-fast), 
                background-color var(--agentary-transition-fast);
    opacity: 1;
    font-family: inherit;
  }

  .agentary-floating-button:hover {
    transform: scale(1.1);
  }

  .agentary-floating-button:disabled {
    background-color: var(--agentary-primary-color);
    cursor: not-allowed;
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
    opacity: 0.5;
  }

  .agentary-floating-button:disabled:hover {
    transform: scale(1);
  }

  .agentary-floating-button .agentary-spinner {
    animation: agentarySpin 1s linear infinite;
  }

  /* Pulsing animation when ready */
  .agentary-floating-button.agentary-ready-pulse {
    animation: agentaryReadyPulse 2s infinite;
  }

  @keyframes agentaryReadyPulse {
    0% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
    }
    50% {
      transform: scale(1.05);
      box-shadow: 0 0 0 8px rgba(0, 123, 255, 0);
    }
    100% {
      transform: scale(1);
      box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
    }
  }

  /* Speech Bubble */
  .agentary-speech-bubble {
    position: relative;
    background-color: var(--agentary-background);
    border: 1px solid var(--agentary-border-color);
    border-radius: var(--agentary-border-radius-small);
    box-shadow: var(--agentary-shadow-dark);
    animation: agentarySpeechBubbleSlideIn 0.4s ease-out forwards;
  }

  .agentary-speech-bubble-content {
    padding: var(--agentary-spacing-sm) var(--agentary-spacing-md);
    font-size: var(--agentary-font-size-sm);
    color: var(--agentary-text-color);
    white-space: nowrap;
    font-family: inherit;
    font-weight: 500;
  }

  .agentary-speech-bubble-arrow {
    position: absolute;
    top: 50%;
    right: -6px;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid var(--agentary-background);
    border-top: 6px solid transparent;
    border-bottom: 6px solid transparent;
  }

  .agentary-speech-bubble-arrow::before {
    content: '';
    position: absolute;
    top: -7px;
    left: -7px;
    width: 0;
    height: 0;
    border-left: 7px solid var(--agentary-border-color);
    border-top: 7px solid transparent;
    border-bottom: 7px solid transparent;
  }

  @keyframes agentarySpeechBubbleSlideIn {
    0% {
      opacity: 0;
      transform: translateX(-10px) scale(0.9);
    }
    100% {
      opacity: 1;
      transform: translateX(0) scale(1);
    }
  }

  .agentary-send-button {
    width: 40px;
    height: 40px;
    border-radius: var(--agentary-border-radius-button);
    background-color: var(--agentary-primary-color);
    color: white;
    border: none;
    cursor: pointer;
    font-size: var(--agentary-font-size-md);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--agentary-transition-fast);
    font-family: inherit;
    flex-shrink: 0;
  }

  .agentary-send-button:hover {
    background-color: var(--agentary-primary-hover);
    transform: scale(1.05);
  }

  .agentary-send-button:focus-visible {
    outline: 2px solid var(--agentary-primary-color);
    outline-offset: 2px;
  }

  .agentary-close-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--agentary-font-size-lg);
    color: var(--agentary-text-muted);
    padding: var(--agentary-spacing-xs);
    border-radius: var(--agentary-spacing-xs);
    transition: background-color var(--agentary-transition-fast);
    font-family: inherit;
  }

  .agentary-close-button:hover {
    background-color: #e9ecef;
  }

  .agentary-chat-back-button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: var(--agentary-font-size-lg);
    color: var(--agentary-text-muted);
    padding: var(--agentary-spacing-xs);
    border-radius: var(--agentary-spacing-xs);
    transition: background-color var(--agentary-transition-fast);
    font-family: inherit;
    margin-right: var(--agentary-spacing-sm);
  }

  .agentary-chat-back-button:hover {
    background-color: #e9ecef;
  }

  .agentary-chat-send-button {
    width: 40px;
    height: 40px;
    border-radius: var(--agentary-border-radius-button);
    background-color: var(--agentary-primary-color);
    color: white;
    border: none;
    cursor: pointer;
    font-size: var(--agentary-font-size-md);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--agentary-transition-fast);
    font-family: inherit;
    flex-shrink: 0;
  }

  .agentary-chat-send-button:hover {
    background-color: var(--agentary-primary-hover);
    transform: scale(1.05);
  }

  .agentary-chat-send-button:focus-visible {
    outline: 2px solid var(--agentary-primary-color);
    outline-offset: 2px;
  }
`; 