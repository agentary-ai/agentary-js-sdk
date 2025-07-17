/**
 * Responsive design and accessibility styles
 */
export const responsiveStyles = `
  /* Responsive design */
  @media (max-width: 480px) {
    .agentary-popup {
      width: calc(100vw - 2 * var(--agentary-spacing-xl));
      max-height: calc(100vh - 180px);
      min-height: 160px;
      bottom: calc(60px + var(--agentary-spacing-lg) + var(--agentary-spacing-lg));
      right: var(--agentary-spacing-xl);
    }
    
    /* Chat interface mobile adjustments - match popup height behavior */
    .agentary-chat-container {
      width: calc(100vw - 2 * var(--agentary-spacing-xl));
      height: auto;
      min-height: 160px;
      max-height: calc(100vh - 180px);
      bottom: calc(60px + var(--agentary-spacing-lg) + var(--agentary-spacing-lg));
      right: var(--agentary-spacing-xl);
    }
    
    .agentary-chat-messages {
      padding: var(--agentary-spacing-lg) var(--agentary-spacing-xl);
    }
    
    .agentary-chat-input-container {
      padding: 0 var(--agentary-spacing-lg) var(--agentary-spacing-lg) var(--agentary-spacing-lg);
    }
    
    .agentary-floating-button-container {
      bottom: var(--agentary-spacing-lg);
      right: var(--agentary-spacing-lg);
    }
    
    /* Make content more compact on mobile */
    .agentary-content {
      padding: var(--agentary-spacing-xl) var(--agentary-spacing-lg);
    }
    
    .agentary-question-input-container {
      margin-bottom: var(--agentary-spacing-xl);
      padding: var(--agentary-spacing-md);
    }
    
    .agentary-input-row {
      margin-bottom: var(--agentary-spacing-xl);
    }
    
    .agentary-summary-container {
      margin-bottom: var(--agentary-spacing-md);
    }
    
    .agentary-summary-content {
      max-height: 80px;
      padding: var(--agentary-spacing-sm);
    }
    
    .agentary-content-prompt-section {
      margin-bottom: var(--agentary-spacing-sm);
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
      margin-bottom: var(--agentary-spacing-md);
    }
    
    .agentary-footer {
      padding: var(--agentary-spacing-sm) var(--agentary-spacing-md);
    }
    
    .agentary-related-articles-wrapper {
      margin-bottom: var(--agentary-spacing-md);
    }
    
    .agentary-related-article-card {
      height: 140px;
    }
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
      .agentary-popup,
  .agentary-floating-button-container {
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
  .agentary-floating-button-container {
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
    .agentary-floating-button-container,
    .agentary-floating-button {
      transition: none !important;
    }
  }
`; 