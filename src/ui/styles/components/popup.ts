/**
 * Popup dialog component styles
 */
export const popupStyles = `
  /* Base container */
  .agentary-container {
    pointer-events: auto;
  }

  /* Black Overlay */
  .agentary-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: calc(var(--agentary-z-index) - 1);
    pointer-events: auto;
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

  .agentary-spinner {
    animation: agentarySpin 1s linear infinite;
  }

  .agentary-fade-in {
    animation: agentaryFadeIn 0.4s ease-out forwards;
  }

  .agentary-fade-out {
    animation: agentaryFadeOut 0.3s forwards;
  }
`; 