/**
 * Input and form component styles
 */
export const inputStyles = `
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
    font-size: var(--agentary-font-size-md);
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
`; 