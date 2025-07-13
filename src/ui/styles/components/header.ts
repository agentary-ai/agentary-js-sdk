/**
 * Header component styles
 */
export const headerStyles = `
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

  .agentary-chat-header {
    flex-shrink: 0;
    padding: var(--agentary-spacing-lg) var(--agentary-spacing-xl);
    border-bottom: 1px solid var(--agentary-border-color);
    background-color: var(--agentary-background);
    display: flex;
    align-items: center;
    gap: var(--agentary-spacing-sm);
  }

  .agentary-chat-header-content {
    flex: 1;
  }

  .agentary-chat-title {
    margin: 0 0 2px 0;
    font-size: var(--agentary-font-size-md);
    font-weight: 600;
    color: var(--agentary-text-color);
  }

  .agentary-chat-subtitle {
    margin: 0;
    font-size: var(--agentary-font-size-sm);
    color: var(--agentary-text-muted);
  }
`; 