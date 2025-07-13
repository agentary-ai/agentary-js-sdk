/**
 * Content component styles
 */
export const contentStyles = `
  /* Content */
  .agentary-content {
    flex: 1 1 auto;
    padding: var(--agentary-spacing-3xl);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    width: 100%;
    text-align: center;
    color: var(--agentary-text-muted);
    overflow-y: auto;
    min-height: 0;
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }

  /* Hide scrollbar for Chrome, Safari and Opera */
  .agentary-content::-webkit-scrollbar {
    display: none;
  }

  .agentary-content-icon {
    font-size: 48px;
    margin-bottom: var(--agentary-spacing-lg);
    color: var(--agentary-primary-color);
    animation: agentarySpin 2s linear infinite;
  }

  .agentary-content-title {
    margin: 0 0 var(--agentary-spacing-sm) 0;
    font-size: var(--agentary-font-size-lg);
    color: var(--agentary-text-color);
  }

  .agentary-content-description {
    margin: 0;
    font-size: var(--agentary-font-size-md);
    line-height: 1.5;
  }

  .agentary-feature-notice {
    margin-top: var(--agentary-spacing-lg);
    padding: var(--agentary-spacing-md);
    background-color: var(--agentary-background-muted);
    border-radius: var(--agentary-border-radius-small);
    font-size: var(--agentary-font-size-sm);
  }

  .agentary-feature-icon {
    margin-right: 6px;
    color: #ffc107;
  }

  /* Content-specific learning prompts */
  .agentary-content-prompt-section {
    margin-top: 0;
    margin-bottom: var(--agentary-spacing-lg);
  }

  .agentary-content-prompt-label {
    font-size: var(--agentary-font-size-sm);
    color: var(--agentary-text-muted);
    text-align: center;
    margin-bottom: var(--agentary-spacing-md);
    font-weight: 500;
  }

  .agentary-content-prompt-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--agentary-spacing-sm);
    padding: var(--agentary-spacing-sm) var(--agentary-spacing-md);
    background-color: var(--agentary-background-muted);
    border: 1px solid var(--agentary-border-color);
    border-radius: var(--agentary-border-radius-small);
    font-size: var(--agentary-font-size-sm);
    color: var(--agentary-text-color);
    cursor: pointer;
    transition: all var(--agentary-transition-fast);
    font-family: inherit;
    font-weight: 500;
    margin-bottom: 0;
  }

  .agentary-content-prompt-toggle:hover {
    background-color: var(--agentary-primary-color);
    color: white;
    border-color: var(--agentary-primary-color);
  }

  .agentary-content-prompt-toggle i {
    font-size: var(--agentary-font-size-sm);
    transition: transform var(--agentary-transition-fast);
  }

  .agentary-content-prompt-count {
    background-color: var(--agentary-primary-color);
    color: white;
    font-size: 11px;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 600;
    margin-left: auto;
  }

  .agentary-content-prompt-toggle:hover .agentary-content-prompt-count {
    background-color: white;
    color: var(--agentary-primary-color);
  }

  .agentary-content-prompt-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--agentary-spacing-xs);
    padding: var(--agentary-spacing-sm) var(--agentary-spacing-md);
    background-color: transparent;
    border: 1px solid var(--agentary-primary-color);
    border-radius: 20px;
    font-size: var(--agentary-font-size-md);
    color: var(--agentary-primary-color);
    cursor: pointer;
    transition: all var(--agentary-transition-fast);
    font-family: inherit;
    line-height: 1.3;
    text-align: left;
    max-width: 100%;
    box-sizing: border-box;
  }

  .agentary-content-prompt-pill:hover {
    background-color: var(--agentary-primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }

  .agentary-content-prompt-pill i {
    font-size: var(--agentary-font-size-md);
    opacity: 0.8;
    flex-shrink: 0;
  }

  .agentary-content-prompt-pill:hover i {
    opacity: 1;
  }

  /* Content prompts expansion animation */
  .agentary-expandable-prompts {
    overflow: hidden;
    transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out;
    max-height: 0;
    opacity: 0;
    margin-top: 0;
  }

  .agentary-expandable-prompts.agentary-expanded {
    max-height: 500px; /* Generous max-height to accommodate content */
    opacity: 1;
  }

  .agentary-expandable-prompts .agentary-content-prompt-pill {
    margin-bottom: var(--agentary-spacing-xl);
    transform: translateY(10px);
    opacity: 0;
    transition: transform 0.3s ease-out, opacity 0.3s ease-out;
  }

  .agentary-expandable-prompts.agentary-expanded .agentary-content-prompt-pill {
    transform: translateY(0);
    opacity: 1;
  }

  .agentary-expandable-prompts.agentary-expanded .agentary-content-prompt-pill:nth-child(1) {
    transition-delay: 0.1s;
  }

  .agentary-expandable-prompts.agentary-expanded .agentary-content-prompt-pill:nth-child(2) {
    transition-delay: 0.2s;
  }

  .agentary-expandable-prompts.agentary-expanded .agentary-content-prompt-pill:nth-child(3) {
    transition-delay: 0.3s;
  }

  @keyframes agentaryContentSlideIn {
    0% {
      opacity: 0;
      transform: translateY(-10px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Page Summary Styles */
  .agentary-summary-container {
    margin-bottom: var(--agentary-spacing-2xl);
  }

  .agentary-summary-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--agentary-spacing-lg);
  }

  .agentary-summary-content {
    font-size: var(--agentary-font-size-md);
    line-height: 1.6;
    color: var(--agentary-text-color);
    text-align: left;
    position: relative;
    max-height: 100px;
    overflow-y: auto;
    padding: var(--agentary-spacing-md);
  }

  .agentary-summary-error {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--agentary-spacing-lg);
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: var(--agentary-border-radius-small);
    color: #721c24;
    font-size: var(--agentary-font-size-sm);
  }

  /* Legacy styling for backwards compatibility */
  .agentary-content .agentary-prompt-pills-container:last-child {
    padding-top: var(--agentary-spacing-2xl);
    border-top: 1px solid var(--agentary-border-color);
  }

  /* Streaming cursor */
  .agentary-streaming-cursor {
    display: inline-block;
    width: 2px;
    height: 1.2em;
    background-color: var(--agentary-primary-color);
    animation: agentaryStreamingBlink 1s infinite;
    margin-left: 1px;
  }

  @keyframes agentaryStreamingBlink {
    0%, 50% {
      opacity: 1;
    }
    51%, 100% {
      opacity: 0;
    }
  }
`; 