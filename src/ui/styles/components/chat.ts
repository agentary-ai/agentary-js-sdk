/**
 * Chat interface component styles
 */
export const chatStyles = `
  /* Chat Interface Styles */
  .agentary-chat-container {
    position: fixed;
    bottom: calc(60px + var(--agentary-spacing-xl) + var(--agentary-spacing-lg));
    right: var(--agentary-spacing-xl);
    width: 400px;
    height: 500px;
    max-height: calc(100vh - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
    background-color: var(--agentary-background);
    border-radius: var(--agentary-border-radius);
    box-shadow: var(--agentary-shadow-dark);
    border: 1px solid var(--agentary-border-color);
    display: flex;
    flex-direction: column;
    z-index: var(--agentary-z-index);
    overflow: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    font-size: var(--agentary-font-size-md);
    line-height: 1.5;
  }

  .agentary-chat-container.agentary-slide-in {
    animation: agentaryPopupSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .agentary-chat-container.agentary-slide-out {
    animation: agentaryPopupSlideOut 0.3s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
  }

  .agentary-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: var(--agentary-spacing-2xl) var(--agentary-spacing-3xl);
    display: flex;
    flex-direction: column;
    gap: var(--agentary-spacing-lg);
  }

  .agentary-chat-message {
    display: flex;
    flex-direction: column;
    max-width: 80%;
    animation: agentaryFadeIn 0.3s ease-out;
  }

  .agentary-chat-message-user {
    align-self: flex-end;
    align-items: flex-end;
  }

  .agentary-chat-message-assistant {
    align-self: flex-start;
    align-items: flex-start;
  }

  .agentary-chat-message-content {
    padding: var(--agentary-spacing-sm) var(--agentary-spacing-md);
    border-radius: var(--agentary-spacing-lg);
    font-size: var(--agentary-font-size-md);
    line-height: 1.4;
    word-wrap: break-word;
  }

  .agentary-chat-message-user .agentary-chat-message-content {
    background-color: var(--agentary-primary-color);
    color: white;
    border-bottom-right-radius: var(--agentary-spacing-xs);
  }

  .agentary-chat-message-assistant .agentary-chat-message-content {
    background-color: var(--agentary-background-muted);
    color: var(--agentary-text-color);
    border-bottom-left-radius: var(--agentary-spacing-xs);
  }

  .agentary-chat-message-time {
    font-size: 11px;
    color: var(--agentary-text-muted);
    margin-top: var(--agentary-spacing-xs);
    padding: 0 var(--agentary-spacing-xs);
  }

  .agentary-chat-typing-indicator {
    display: flex;
    align-items: center;
    gap: var(--agentary-spacing-xs);
  }

  .agentary-chat-typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--agentary-text-muted);
    animation: agentaryTypingDot 1.4s infinite both;
  }

  .agentary-chat-typing-indicator span:nth-child(1) {
    animation-delay: -0.32s;
  }

  .agentary-chat-typing-indicator span:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes agentaryTypingDot {
    0%, 80%, 100% {
      transform: scale(0.8);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }

  .agentary-chat-input-container {
    padding: 0 var(--agentary-spacing-2xl) var(--agentary-spacing-2xl) var(--agentary-spacing-2xl);
    background-color: var(--agentary-background);
    flex-shrink: 0;
    position: relative;
  }

  .agentary-chat-input-container::before {
    content: '';
    position: absolute;
    top: -60px;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(to bottom, transparent 0%, var(--agentary-background) 100%);
    pointer-events: none;
    z-index: 1;
  }

  .agentary-chat-input-row {
    display: flex;
    align-items: center;
    background-color: var(--agentary-background-muted);
    border: 1px solid var(--agentary-border-color);
    border-radius: var(--agentary-border-radius);
    padding: var(--agentary-spacing-md) var(--agentary-spacing-lg);
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.03);
    gap: var(--agentary-spacing-sm);
  }

  .agentary-chat-input {
    flex: 1;
    font-size: var(--agentary-font-size-md);
    font-family: inherit;
    color: var(--agentary-text-color);
    background-color: transparent;
    border: none;
    outline: none;
    transition: all var(--agentary-transition-fast);
  }

  .agentary-chat-input:focus {
    color: var(--agentary-text-color);
  }

  .agentary-chat-input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .agentary-chat-input::placeholder {
    color: var(--agentary-text-muted);
  }

  /* Markdown content styling */
  .agentary-chat-message-content h1,
  .agentary-chat-message-content h2,
  .agentary-chat-message-content h3,
  .agentary-chat-message-content h4,
  .agentary-chat-message-content h5,
  .agentary-chat-message-content h6 {
    margin: var(--agentary-spacing-sm) 0;
    font-weight: 600;
    line-height: 1.3;
    color: var(--agentary-text-color);
  }

  .agentary-chat-message-content h1 { font-size: 1.4em; }
  .agentary-chat-message-content h2 { font-size: 1.3em; }
  .agentary-chat-message-content h3 { font-size: 1.2em; }
  .agentary-chat-message-content h4 { font-size: 1.1em; }
  .agentary-chat-message-content h5 { font-size: 1.05em; }
  .agentary-chat-message-content h6 { font-size: 1em; }

  .agentary-chat-message-content p {
    margin: var(--agentary-spacing-sm) 0;
    line-height: 1.5;
  }

  .agentary-chat-message-content ul,
  .agentary-chat-message-content ol {
    margin: var(--agentary-spacing-sm) 0;
    padding-left: var(--agentary-spacing-xl);
  }

  .agentary-chat-message-content li {
    margin: var(--agentary-spacing-xs) 0;
    line-height: 1.4;
  }

  .agentary-chat-message-content code {
    background-color: var(--agentary-background-muted);
    padding: 2px 4px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
    border: 1px solid var(--agentary-border-color);
  }

  .agentary-chat-message-content pre {
    background-color: var(--agentary-background-muted);
    padding: var(--agentary-spacing-md);
    border-radius: var(--agentary-border-radius);
    border: 1px solid var(--agentary-border-color);
    overflow-x: auto;
    margin: var(--agentary-spacing-sm) 0;
  }

  .agentary-chat-message-content pre code {
    background: none;
    padding: 0;
    border: none;
    font-size: 0.85em;
  }

  .agentary-chat-message-content blockquote {
    border-left: 3px solid var(--agentary-primary-color);
    margin: var(--agentary-spacing-sm) 0;
    padding-left: var(--agentary-spacing-md);
    color: var(--agentary-text-muted);
    font-style: italic;
  }

  .agentary-chat-message-content strong {
    font-weight: 600;
  }

  .agentary-chat-message-content em {
    font-style: italic;
  }
`; 