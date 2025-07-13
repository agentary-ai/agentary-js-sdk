/**
 * CSS Keyframe animations for the Agentary UI
 */
export const animations = `
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
`; 