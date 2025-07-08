/**
 * CSS-in-JS styles for the Popup component
 * Using programmatic injection to avoid conflicts in host websites
 */

// CSS Custom Properties for theming
const cssVariables = {
  '--agentary-primary-color': '#007bff',
  '--agentary-primary-hover': '#0056b3',
  '--agentary-text-color': '#333',
  '--agentary-text-muted': '#666',
  '--agentary-background': '#ffffff',
  '--agentary-background-muted': '#f8f9fa',
  '--agentary-border-color': '#f2f2f2',
  '--agentary-border-radius': '24px',
  '--agentary-border-radius-small': '8px',
  '--agentary-border-radius-button': '50%',
  '--agentary-shadow-light': '0 4px 12px rgba(0, 123, 255, 0.3)',
  '--agentary-shadow-dark': '0 8px 32px rgba(0, 0, 0, 0.1)',
  '--agentary-spacing-xs': '4px',
  '--agentary-spacing-sm': '8px',
  '--agentary-spacing-md': '12px',
  '--agentary-spacing-lg': '16px',
  '--agentary-spacing-xl': '20px',
  '--agentary-spacing-2xl': '24px',
  '--agentary-spacing-3xl': '32px',
  '--agentary-font-size-sm': '12px',
  '--agentary-font-size-md': '14px',
  '--agentary-font-size-lg': '18px',
  '--agentary-font-size-xl': '24px',
  '--agentary-z-index': '10000',
  '--agentary-transition-fast': '0.2s ease',
  '--agentary-transition-medium': '0.3s ease',
  '--agentary-animation-bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  '--agentary-animation-slide-out': 'cubic-bezier(0.36, 0, 0.66, -0.56)',
};

// CSS styles as a string
const cssStyles = `
  /* Keyframe animations */
  @keyframes agentaryPopupSlideIn {
    0% {
      opacity: 0;
      transform: translateY(20px) translateX(10px) scale(0.95);
    }
    100% {
      opacity: 1;
      transform: translateY(0) translateX(0) scale(1);
    }
  }
  
  @keyframes agentaryPopupSlideOut {
    0% {
      opacity: 1;
      transform: translateY(0) translateX(0) scale(1);
    }
    100% {
      opacity: 0;
      transform: translateY(20px) translateX(10px) scale(0.95);
    }
  }
  
  @keyframes agentarySpin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes agentaryFadeIn {
    0% {
      opacity: 0;
      transform: translateY(10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes agentaryFadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }

  /* Base container */
  .agentary-container {
    pointer-events: auto;
  }

  /* Floating Action Button */
  .agentary-floating-button {
    position: fixed;
    bottom: var(--agentary-spacing-xl);
    right: var(--agentary-spacing-xl);
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
    z-index: var(--agentary-z-index);
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

  .agentary-spinner {
    animation: agentarySpin 1s linear infinite;
  }

  .agentary-fade-in {
    animation: agentaryFadeIn 0.4s ease-out forwards;
  }

  .agentary-fade-out {
    animation: agentaryFadeOut 0.3s forwards;
  }

  /* Popup Dialog */
  .agentary-popup {
    position: fixed;
    bottom: calc(60px + var(--agentary-spacing-xl) + var(--agentary-spacing-lg));
    right: var(--agentary-spacing-xl);
    width: 400px;
    min-height: 300px;
    max-height: calc(100vh - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
    height: auto;
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

  .agentary-popup.agentary-slide-in {
    animation: agentaryPopupSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .agentary-popup.agentary-slide-out {
    animation: agentaryPopupSlideOut 0.3s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
  }

  /* Header */
  .agentary-header {
    padding: 0 var(--agentary-spacing-xl);
    margin-top: var(--agentary-spacing-lg);
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }

  .agentary-header-content {
    display: flex;
    align-items: center;
    gap: var(--agentary-spacing-sm);
  }

  .agentary-header-icon {
    color: var(--agentary-primary-color);
    font-size: var(--agentary-spacing-xl);
  }

  .agentary-header-title {
    margin: 0;
    font-size: var(--agentary-font-size-lg);
    font-weight: 600;
    color: var(--agentary-text-color);
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

  /* Question Input */
  .agentary-question-input-container {
    width: 100%;
    margin-bottom: var(--agentary-spacing-3xl);
    background-color: var(--agentary-background-muted);
    border: 1px solid var(--agentary-border-color);
    border-radius: var(--agentary-border-radius);
    padding: var(--agentary-spacing-xl);
    box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.03);
  }

  .agentary-input-row {
    display: flex;
    align-items: center;
    margin-bottom: var(--agentary-spacing-3xl);
  }

  .agentary-question-input {
    flex: 1;
    font-size: var(--agentary-font-size-lg);
    font-family: inherit;
    color: var(--agentary-text-color);
    transition: all var(--agentary-transition-fast);
    outline: none;
    margin-right: var(--agentary-spacing-md);
    border: none;
    background-color: transparent;
  }

  .agentary-question-input::placeholder {
    color: var(--agentary-text-muted);
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

  /* Prompt Pills */
  .agentary-prompt-pills-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--agentary-spacing-xl);
    justify-content: center;
  }

  /* Action Prompts Container - dedicated styling */
  .agentary-action-prompts-container {
    display: flex;
    flex-wrap: wrap;
    gap: var(--agentary-spacing-lg);
    justify-content: center;
    padding-top: var(--agentary-spacing-2xl);
    border-top: 1px solid var(--agentary-border-color);
  }

  /* Single action prompt takes full width */
  .agentary-action-prompts-container .agentary-prompt-pill:only-child,
  .agentary-prompt-pills-container .agentary-prompt-pill:only-child {
    width: 100%;
    justify-content: center;
    max-width: none;
  }

  .agentary-prompt-pill {
    display: inline-flex;
    align-items: center;
    gap: var(--agentary-spacing-xs);
    padding: var(--agentary-spacing-sm) var(--agentary-spacing-md);
    background-color: var(--agentary-background-muted);
    border: 1px solid var(--agentary-border-color);
    border-radius: 20px;
    font-size: var(--agentary-font-size-sm);
    color: var(--agentary-text-color);
    cursor: pointer;
    transition: all var(--agentary-transition-fast);
    font-family: inherit;
    white-space: nowrap;
  }

  .agentary-prompt-pill:hover {
    background-color: var(--agentary-primary-color);
    color: white;
    border-color: var(--agentary-primary-color);
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);
  }

  .agentary-prompt-pill i {
    font-size: var(--agentary-font-size-sm);
    opacity: 0.8;
  }

  .agentary-prompt-pill:hover i {
    opacity: 1;
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

  /* Footer */
  .agentary-footer {
    flex-shrink: 0;
    padding: var(--agentary-spacing-lg) var(--agentary-spacing-xl);
    border-top: 1px solid var(--agentary-border-color);
    background-color: var(--agentary-background-muted);
    font-size: var(--agentary-font-size-sm);
    color: var(--agentary-text-muted);
    text-align: center;
    position: relative;
  }

  /* Footer Gradient Overlay */
  .agentary-footer-gradient {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    height: 60px;
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.7) 50%,
      rgba(248, 249, 250, 0.9) 80%,
      rgba(248, 249, 250, 1) 100%
    );
    pointer-events: none;
    z-index: 5;
  }

  /* Dark mode gradient */
  @media (prefers-color-scheme: dark) {
    .agentary-footer-gradient {
      background: linear-gradient(
        to bottom,
        rgba(52, 58, 64, 0) 0%,
        rgba(52, 58, 64, 0.7) 50%,
        rgba(73, 80, 87, 0.9) 80%,
        rgba(73, 80, 87, 1) 100%
      );
    }
  }

  /* Scroll Indicator */
  .agentary-scroll-indicator {
    position: absolute;
    bottom: calc(var(--agentary-spacing-lg) + 60px);
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 36px;
    background-color: var(--agentary-primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all var(--agentary-transition-fast);
    z-index: 15;
    animation: agentaryBounce 2s infinite;
  }

  .agentary-scroll-indicator:hover {
    transform: translateX(-50%) scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .agentary-scroll-indicator i {
    font-size: var(--agentary-font-size-md);
    animation: agentaryScrollPulse 1.5s infinite;
  }

  @keyframes agentaryBounce {
    0%, 100% {
      transform: translateX(-50%) translateY(0);
    }
    50% {
      transform: translateX(-50%) translateY(-8px);
    }
  }

  @keyframes agentaryScrollPulse {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(3px);
    }
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .agentary-popup {
      width: calc(100vw - 2 * var(--agentary-spacing-xl));
      max-height: calc(100vh - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
      min-height: 250px;
      bottom: calc(60px + var(--agentary-spacing-lg) + var(--agentary-spacing-lg));
      right: var(--agentary-spacing-xl);
    }
    
    .agentary-floating-button {
      bottom: var(--agentary-spacing-lg);
      right: var(--agentary-spacing-lg);
    }
    
    .agentary-prompt-pills-container {
      gap: var(--agentary-spacing-sm);
    }
    
    .agentary-prompt-pill {
      font-size: 11px;
      padding: 6px var(--agentary-spacing-sm);
    }
    
    .agentary-content-prompt-pill {
      font-size: var(--agentary-font-size-sm);
      padding: var(--agentary-spacing-xs) var(--agentary-spacing-sm);
      border-radius: 16px;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    .agentary-popup,
    .agentary-floating-button {
      --agentary-text-color: #e9ecef;
      --agentary-text-muted: #adb5bd;
      --agentary-background: #343a40;
      --agentary-background-muted: #495057;
      --agentary-border-color: #495057;
      --agentary-shadow-dark: 0 8px 32px rgba(0, 0, 0, 0.3);
    }
  }

  /* Accessibility improvements */
  .agentary-floating-button:focus-visible,
  .agentary-close-button:focus-visible {
    outline: 2px solid var(--agentary-primary-color);
    outline-offset: 2px;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .agentary-popup,
    .agentary-floating-button {
      --agentary-border-color: #000;
      --agentary-shadow-dark: 0 8px 32px rgba(0, 0, 0, 0.5);
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .agentary-popup.agentary-slide-in,
    .agentary-popup.agentary-slide-out {
      animation: none;
    }
    
    .agentary-content-icon {
      animation: none;
    }
    
    .agentary-floating-button .agentary-spinner {
      animation: none;
    }
    
    .agentary-expandable-prompts,
    .agentary-expandable-prompts .agentary-content-prompt-pill {
      transition: none !important;
    }
    
    .agentary-popup *,
    .agentary-floating-button {
      transition: none !important;
    }
  }

  /* Legacy styling for backwards compatibility */
  .agentary-content .agentary-prompt-pills-container:last-child {
    padding-top: var(--agentary-spacing-2xl);
    border-top: 1px solid var(--agentary-border-color);
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

  .agentary-chat-header {
    padding: var(--agentary-spacing-md) var(--agentary-spacing-lg);
    border-bottom: 1px solid var(--agentary-border-color);
    background-color: var(--agentary-background);
    display: flex;
    align-items: center;
    gap: var(--agentary-spacing-md);
    flex-shrink: 0;
  }

  .agentary-chat-back-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: var(--agentary-spacing-xs);
    border-radius: var(--agentary-border-radius-small);
    color: var(--agentary-text-muted);
    font-size: var(--agentary-font-size-md);
    transition: all var(--agentary-transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
  }

  .agentary-chat-back-button:hover {
    background-color: var(--agentary-background-muted);
    color: var(--agentary-primary-color);
  }

  .agentary-chat-header-content {
    flex: 1;
  }

  .agentary-chat-title {
    font-size: var(--agentary-font-size-md);
    font-weight: 600;
    color: var(--agentary-text-color);
    margin-bottom: var(--agentary-spacing-sm);
    line-height: 1.2;
  }

  .agentary-chat-subtitle {
    font-size: var(--agentary-font-size-sm);
    color: var(--agentary-text-muted);
    margin: 0;
    line-height: 1.2;
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

  .agentary-chat-send-button {
    width: 36px;
    height: 36px;
    border-radius: var(--agentary-border-radius-button);
    background-color: var(--agentary-primary-color);
    color: white;
    border: none;
    cursor: pointer;
    font-size: var(--agentary-font-size-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--agentary-transition-fast);
    font-family: inherit;
    flex-shrink: 0;
  }

  .agentary-chat-send-button:hover:not(:disabled) {
    background-color: var(--agentary-primary-hover);
    transform: scale(1.05);
  }

  .agentary-chat-send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .agentary-chat-send-button:focus-visible {
    outline: 2px solid var(--agentary-primary-color);
    outline-offset: 2px;
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

  .agentary-chat-message-content a {
    color: var(--agentary-primary-color);
    text-decoration: none;
  }

  .agentary-chat-message-content a:hover {
    text-decoration: underline;
  }

  .agentary-chat-message-content table {
    border-collapse: collapse;
    width: 100%;
    margin: var(--agentary-spacing-sm) 0;
    font-size: 0.9em;
  }

  .agentary-chat-message-content th,
  .agentary-chat-message-content td {
    border: 1px solid var(--agentary-border-color);
    padding: var(--agentary-spacing-xs) var(--agentary-spacing-sm);
    text-align: left;
  }

  .agentary-chat-message-content th {
    background-color: var(--agentary-background-muted);
    font-weight: 600;
  }

  /* Related Articles Carousel */
  .agentary-related-articles {
    max-width: 100%;
  }

  .agentary-related-articles-wrapper {
    width: 100%;
    margin-top: var(--agentary-spacing-xl);
  }

  .agentary-related-articles-header {
    display: flex;
    align-items: center;
    gap: var(--agentary-spacing-sm);
    margin-bottom: var(--agentary-spacing-md);
    font-weight: 600;
    color: var(--agentary-text-color);
    font-size: var(--agentary-font-size-md);
  }

  .agentary-related-articles-header i {
    color: var(--agentary-primary-color);
    font-size: var(--agentary-font-size-md);
  }

  .agentary-related-articles-carousel {
  }

  .agentary-related-articles-container {
    display: flex;
    padding-top: var(--agentary-spacing-md);
    gap: 0;
    overflow-x: auto;
    scroll-behavior: smooth;
    scroll-snap-type: x mandatory;
    padding-bottom: var(--agentary-spacing-sm);
    scrollbar-width: none;
    -ms-overflow-style: none;
    width: 100%;
    max-width: 100%;
  }

  .agentary-related-articles-container::-webkit-scrollbar {
    display: none;
  }

  .agentary-related-article-card {
    flex: 0 0 100%;
    height: 160px;
    padding: 0 var(--agentary-spacing-sm);
    box-sizing: border-box;
    scroll-snap-align: start;
    opacity: 1;
    transition: opacity 0.3s ease;
  }

  .agentary-related-article-card:hover {
    opacity: 0.85;
  }

  .agentary-related-article-image-bg {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url('./public/img/article-placeholder.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    display: flex;
    align-items: flex-end;
    border-radius: var(--agentary-border-radius);
    overflow: hidden;
    cursor: pointer;
  }

  .agentary-related-article-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.3) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }

  .agentary-related-article-content {
    position: relative;
    z-index: 2;
    padding: var(--agentary-spacing-lg);
    color: white;
    width: 100%;
  }

  .agentary-related-article-title {
    font-weight: 500;
    font-size: var(--agentary-font-size-lg);
    line-height: 1.3;
    margin-bottom: var(--agentary-spacing-sm);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .agentary-related-article-summary {
    font-size: var(--agentary-font-size-sm);
    font-weight: 400;
    line-height: 1.4;
    margin-bottom: var(--agentary-spacing-xs);
    opacity: 0.85;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .agentary-related-article-source {
    font-size: var(--agentary-font-size-sm);
    font-weight: 600;
    opacity: 0.9;
    line-height: 1.3;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  }

  .agentary-related-articles-navigation {
    display: flex;
    justify-content: center;
    margin-top: var(--agentary-spacing-md);
  }

  .agentary-related-articles-dots {
    display: flex;
    gap: var(--agentary-spacing-xs);
  }

  .agentary-related-articles-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--agentary-border-color);
    cursor: pointer;
    transition: background-color var(--agentary-transition-fast);
  }

  .agentary-related-articles-dot.agentary-active,
  .agentary-related-articles-dot:hover {
    background-color: var(--agentary-primary-color);
  }

  /* Skeleton loading animation */
  .agentary-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
  }

  .agentary-skeleton-article {
    flex: 0 0 100%;
    height: 160px;
    padding: 0 var(--agentary-spacing-sm);
    box-sizing: border-box;
    scroll-snap-align: start;
  }

  .agentary-skeleton-article-bg {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: var(--agentary-border-radius);
    overflow: hidden;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
  }

  .agentary-skeleton-content {
    position: absolute;
    bottom: var(--agentary-spacing-lg);
    left: var(--agentary-spacing-lg);
    right: var(--agentary-spacing-lg);
    z-index: 2;
  }

  .agentary-skeleton-title {
    height: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,0.8) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.8) 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
    border-radius: 4px;
    margin-bottom: var(--agentary-spacing-xs);
  }

  .agentary-skeleton-title-short {
    width: 75%;
    height: 16px;
    background: linear-gradient(90deg, rgba(255,255,255,0.8) 25%, rgba(255,255,255,0.6) 50%, rgba(255,255,255,0.8) 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
    border-radius: 4px;
    margin-bottom: var(--agentary-spacing-sm);
  }

  .agentary-skeleton-source {
    width: 50%;
    height: 12px;
    background: linear-gradient(90deg, rgba(255,255,255,0.7) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.7) 75%);
    background-size: 200% 100%;
    animation: agentarySkeletonLoading 2.5s infinite;
    border-radius: 4px;
  }

  @keyframes agentarySkeletonLoading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* Fade-in animation for loaded articles */
  .agentary-articles-fade-in {
    animation: agentaryArticlesFadeIn 0.6s ease-out forwards;
  }

  @keyframes agentaryArticlesFadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
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

  /* Streaming animations */
  .agentary-streaming-cursor {
    animation: agentaryBlinkCursor 1s infinite;
    color: var(--agentary-primary-color);
    margin-left: 2px;
  }

  @keyframes agentaryBlinkCursor {
    0%, 50% {
      opacity: 1;
    }
    51%, 100% {
      opacity: 0.2;
    }
  }

  /* Chat responsive design */
  @media (max-width: 480px) {
    .agentary-chat-container {
      width: calc(100vw - 2 * var(--agentary-spacing-xl));
      height: calc(100vh - 60px - 3 * var(--agentary-spacing-xl));
      bottom: calc(60px + var(--agentary-spacing-lg) + var(--agentary-spacing-lg));
      right: var(--agentary-spacing-xl);
    }
    
    .agentary-chat-message {
      max-width: 90%;
    }
  }
`;

/**
 * Injects the Agentary styles into the document head
 */
export function injectAgentaryStyles(): void {
  if (typeof document === 'undefined') return;
  
  // Check if styles are already injected
  if (document.getElementById('agentary-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'agentary-styles';
  
  // Add CSS variables to the document root
  const root = document.documentElement;
  Object.entries(cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  // Add CSS styles
  style.textContent = cssStyles;
  document.head.appendChild(style);
}

/**
 * Removes Agentary styles from the document
 */
export function removeAgentaryStyles(): void {
  if (typeof document === 'undefined') return;
  
  const style = document.getElementById('agentary-styles');
  if (style) {
    style.remove();
  }
  
  // Remove CSS variables from the document root
  const root = document.documentElement;
  Object.keys(cssVariables).forEach((property) => {
    root.style.removeProperty(property);
  });
}

/**
 * CSS class names for use in components
 */
export const classNames = {
  container: 'agentary-container',
  floatingButton: 'agentary-floating-button',
  spinner: 'agentary-spinner',
  fadeIn: 'agentary-fade-in',
  fadeOut: 'agentary-fade-out',
  popup: 'agentary-popup',
  slideIn: 'agentary-slide-in',
  slideOut: 'agentary-slide-out',
  header: 'agentary-header',
  headerContent: 'agentary-header-content',
  headerIcon: 'agentary-header-icon',
  headerTitle: 'agentary-header-title',
  closeButton: 'agentary-close-button',
  content: 'agentary-content',
  contentIcon: 'agentary-content-icon',
  contentTitle: 'agentary-content-title',
  contentDescription: 'agentary-content-description',
  featureNotice: 'agentary-feature-notice',
  featureIcon: 'agentary-feature-icon',
  questionInputContainer: 'agentary-question-input-container',
  inputRow: 'agentary-input-row',
  questionInput: 'agentary-question-input',
  footer: 'agentary-footer',
  sendButton: 'agentary-send-button',
  promptPillsContainer: 'agentary-prompt-pills-container',
  actionPromptsContainer: 'agentary-action-prompts-container',
  promptPill: 'agentary-prompt-pill',
  contentPromptSection: 'agentary-content-prompt-section',
  contentPromptLabel: 'agentary-content-prompt-label',
  contentPromptPill: 'agentary-content-prompt-pill',
  contentPromptToggle: 'agentary-content-prompt-toggle',
  expandablePrompts: 'agentary-expandable-prompts',
  expanded: 'agentary-expanded',
  contentPromptCount: 'agentary-content-prompt-count',
  // Chat interface classes
  chatContainer: 'agentary-chat-container',
  chatHeader: 'agentary-chat-header',
  chatBackButton: 'agentary-chat-back-button',
  chatHeaderContent: 'agentary-chat-header-content',
  chatTitle: 'agentary-chat-title',
  chatSubtitle: 'agentary-chat-subtitle',
  chatMessages: 'agentary-chat-messages',
  chatMessage: 'agentary-chat-message',
  chatMessageUser: 'agentary-chat-message-user',
  chatMessageAssistant: 'agentary-chat-message-assistant',
  chatMessageContent: 'agentary-chat-message-content',
  chatMessageTime: 'agentary-chat-message-time',
  chatTypingIndicator: 'agentary-chat-typing-indicator',
  chatInputContainer: 'agentary-chat-input-container',
  chatInputRow: 'agentary-chat-input-row',
  chatInput: 'agentary-chat-input',
  chatSendButton: 'agentary-chat-send-button',
  // Streaming classes
  streamingCursor: 'agentary-streaming-cursor',
  // Related articles classes
  relatedArticles: 'agentary-related-articles',
  relatedArticlesWrapper: 'agentary-related-articles-wrapper',
  relatedArticlesHeader: 'agentary-related-articles-header',
  relatedArticlesCarousel: 'agentary-related-articles-carousel',
  relatedArticlesContainer: 'agentary-related-articles-container',
  relatedArticleCard: 'agentary-related-article-card',
  relatedArticleImageBg: 'agentary-related-article-image-bg',
  relatedArticleOverlay: 'agentary-related-article-overlay',
  relatedArticleContent: 'agentary-related-article-content',
  relatedArticleTitle: 'agentary-related-article-title',
  relatedArticleSummary: 'agentary-related-article-summary',
  relatedArticleSource: 'agentary-related-article-source',
  relatedArticlesNavigation: 'agentary-related-articles-navigation',
  relatedArticlesDots: 'agentary-related-articles-dots',
  relatedArticlesDot: 'agentary-related-articles-dot',
  active: 'agentary-active',
  // Skeleton loading classes
  skeleton: 'agentary-skeleton',
  skeletonArticle: 'agentary-skeleton-article',
  skeletonArticleBg: 'agentary-skeleton-article-bg',
  skeletonContent: 'agentary-skeleton-content',
  skeletonTitle: 'agentary-skeleton-title',
  skeletonTitleShort: 'agentary-skeleton-title-short',
  skeletonSource: 'agentary-skeleton-source',
  // Fade-in animation class
  articlesFadeIn: 'agentary-articles-fade-in',
  // Scroll indicator
  scrollIndicator: 'agentary-scroll-indicator',
  // Footer gradient
  footerGradient: 'agentary-footer-gradient',
}; 