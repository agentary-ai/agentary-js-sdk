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
    background-color: #6c757d;
    cursor: not-allowed;
    box-shadow: 0 4px 12px rgba(108, 117, 125, 0.3);
    opacity: 0.7;
  }

  .agentary-floating-button:disabled:hover {
    transform: scale(1);
  }

  .agentary-floating-button .agentary-spinner {
    animation: agentarySpin 1s linear infinite;
  }

  /* Popup Dialog */
  .agentary-popup {
    position: fixed;
    bottom: var(--agentary-spacing-xl);
    right: var(--agentary-spacing-xl);
    width: 400px;
    height: 600px;
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
    padding: var(--agentary-spacing-lg) var(--agentary-spacing-xl);
    border-bottom: 1px solid var(--agentary-border-color);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--agentary-background-muted);
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
    flex: 1;
    padding: var(--agentary-spacing-xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--agentary-text-muted);
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
    margin-bottom: var(--agentary-spacing-lg);
    position: relative;
  }

  .agentary-question-input {
    width: 100%;
    padding: var(--agentary-spacing-lg) 60px var(--agentary-spacing-lg) var(--agentary-spacing-xl);
    border: 1px solid var(--agentary-border-color);
    border-radius: 50px; /* Full pill shape */
    font-size: var(--agentary-font-size-md);
    font-family: inherit;
    background-color: var(--agentary-background);
    color: var(--agentary-text-color);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);
    transition: all var(--agentary-transition-fast);
    outline: none;
    box-sizing: border-box;
  }

  .agentary-question-input:focus {
    border-color: var(--agentary-primary-color);
    box-shadow: 0 2px 12px rgba(0, 123, 255, 0.2);
  }

  .agentary-question-input::placeholder {
    color: var(--agentary-text-muted);
  }

  .agentary-send-button {
    position: absolute;
    right: var(--agentary-spacing-md);
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 30px;
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
  }

  .agentary-send-button:hover {
    background-color: var(--agentary-primary-hover);
    transform: translateY(-50%) scale(1.05);
  }

  .agentary-send-button:focus-visible {
    outline: 2px solid var(--agentary-primary-color);
    outline-offset: 2px;
  }

  /* Footer */
  .agentary-footer {
    padding: var(--agentary-spacing-lg) var(--agentary-spacing-xl);
    border-top: 1px solid var(--agentary-border-color);
    background-color: var(--agentary-background-muted);
    font-size: var(--agentary-font-size-sm);
    color: var(--agentary-text-muted);
    text-align: center;
  }

  /* Responsive design */
  @media (max-width: 480px) {
    .agentary-popup {
      width: calc(100vw - 2 * var(--agentary-spacing-xl));
      height: calc(100vh - 2 * var(--agentary-spacing-xl));
      bottom: var(--agentary-spacing-xl);
      right: var(--agentary-spacing-xl);
    }
    
    .agentary-floating-button {
      bottom: var(--agentary-spacing-lg);
      right: var(--agentary-spacing-lg);
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
    
    .agentary-popup *,
    .agentary-floating-button {
      transition: none !important;
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
  questionInput: 'agentary-question-input',
  footer: 'agentary-footer',
  sendButton: 'agentary-send-button',
}; 