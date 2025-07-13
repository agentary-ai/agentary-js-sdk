/**
 * Footer component styles
 */
export const footerStyles = `
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
`; 