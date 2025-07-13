/**
 * Responsive design and accessibility styles
 */
export const responsiveStyles = `
  /* JavaScript-based viewport height fallback */
  .agentary-popup {
    max-height: calc(var(--agentary-vh, 1vh) * 100 - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
  }
  
  .agentary-chat-container {
    max-height: calc(var(--agentary-vh, 1vh) * 100 - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
  }

  /* Mobile viewport handling for Safari */
  @supports (height: 100dvh) {
    @media (max-width: 480px) {
      .agentary-popup {
        max-height: calc(100dvh - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
      }
      
      .agentary-chat-container {
        max-height: calc(100dvh - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
      }
    }
  }

  /* iOS Safari specific handling */
  @supports (-webkit-touch-callout: none) {
    @media (max-width: 480px) {
      .agentary-popup {
        bottom: calc(60px + var(--agentary-spacing-lg) + env(safe-area-inset-bottom, 0px));
        max-height: calc(100vh - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg) - env(safe-area-inset-bottom, 0px));
      }
      
      .agentary-chat-container {
        bottom: calc(60px + var(--agentary-spacing-lg) + env(safe-area-inset-bottom, 0px));
        max-height: calc(100vh - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg) - env(safe-area-inset-bottom, 0px));
      }
      
      .agentary-floating-button-container {
        bottom: calc(var(--agentary-spacing-lg) + env(safe-area-inset-bottom, 0px));
      }
    }
  }

  /* Enhanced mobile viewport handling with dvh support */
  @supports (height: 100dvh) and (-webkit-touch-callout: none) {
    @media (max-width: 480px) {
      .agentary-popup {
        max-height: calc(100dvh - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg) - env(safe-area-inset-bottom, 0px));
      }
      
      .agentary-chat-container {
        max-height: calc(100dvh - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg) - env(safe-area-inset-bottom, 0px));
      }
    }
  }

  /* Fallback for older browsers using JavaScript-calculated viewport height */
  @supports not (height: 100dvh) {
    @media (max-width: 480px) {
      .agentary-popup {
        max-height: calc(var(--agentary-vh, 1vh) * 100 - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg) - env(safe-area-inset-bottom, 0px));
      }
      
      .agentary-chat-container {
        max-height: calc(var(--agentary-vh, 1vh) * 100 - 60px - 2 * var(--agentary-spacing-xl) - var(--agentary-spacing-lg) - env(safe-area-inset-bottom, 0px));
      }
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
    
    .agentary-chat-container {
      width: calc(100vw - 2 * var(--agentary-spacing-xl));
      right: var(--agentary-spacing-xl);
      height: auto;
      min-height: 400px;
    }
    
    .agentary-floating-button-container {
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

  /* Extra small screens (portrait phones) */
  @media (max-width: 320px) {
    .agentary-popup {
      width: calc(100vw - 2 * var(--agentary-spacing-lg));
      right: var(--agentary-spacing-lg);
      bottom: calc(60px + var(--agentary-spacing-md) + var(--agentary-spacing-lg));
      min-height: 200px;
    }
    
    .agentary-chat-container {
      width: calc(100vw - 2 * var(--agentary-spacing-lg));
      right: var(--agentary-spacing-lg);
      min-height: 350px;
    }
    
    .agentary-floating-button-container {
      bottom: var(--agentary-spacing-md);
      right: var(--agentary-spacing-md);
    }
  }

  /* Landscape orientation on mobile */
  @media (max-width: 768px) and (orientation: landscape) {
    .agentary-popup {
      max-height: calc(100vh - 60px - var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
      min-height: 200px;
    }
    
    .agentary-chat-container {
      max-height: calc(100vh - 60px - var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
      min-height: 300px;
    }
  }

  /* Enhanced landscape handling with dvh */
  @supports (height: 100dvh) {
    @media (max-width: 768px) and (orientation: landscape) {
      .agentary-popup {
        max-height: calc(100dvh - 60px - var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
      }
      
      .agentary-chat-container {
        max-height: calc(100dvh - 60px - var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
      }
    }
  }

  /* Fallback landscape handling with JavaScript-calculated viewport height */
  @supports not (height: 100dvh) {
    @media (max-width: 768px) and (orientation: landscape) {
      .agentary-popup {
        max-height: calc(var(--agentary-vh, 1vh) * 100 - 60px - var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
      }
      
      .agentary-chat-container {
        max-height: calc(var(--agentary-vh, 1vh) * 100 - 60px - var(--agentary-spacing-xl) - var(--agentary-spacing-lg));
      }
    }
  }

  /* Touch-specific improvements for mobile */
  @media (pointer: coarse) {
    /* Better touch targets */
    .agentary-floating-button {
      min-width: 44px;
      min-height: 44px;
    }
    
    .agentary-content-prompt-pill {
      min-height: 44px;
      padding: var(--agentary-spacing-sm) var(--agentary-spacing-md);
    }
    
    .agentary-prompt-pill {
      min-height: 40px;
      padding: var(--agentary-spacing-sm) var(--agentary-spacing-md);
    }
    
    /* Improve scrolling performance */
    .agentary-content,
    .agentary-chat-messages {
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
    }
    
    /* Better touch feedback */
    .agentary-content-prompt-pill:active,
    .agentary-prompt-pill:active {
      transform: scale(0.95);
      transition: transform 0.1s ease;
    }
    
    /* Prevent text selection on touch elements */
    .agentary-floating-button,
    .agentary-content-prompt-pill,
    .agentary-prompt-pill {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -khtml-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }

  /* Hover capabilities (desktop) */
  @media (hover: hover) {
    .agentary-content-prompt-pill:hover,
    .agentary-prompt-pill:hover {
      transform: translateY(-1px);
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
    
    .agentary-content-prompt-pill:active,
    .agentary-prompt-pill:active {
      transform: none !important;
      transition: none !important;
    }
  }
`; 