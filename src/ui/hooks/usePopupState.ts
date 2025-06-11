import { useState } from 'preact/hooks';

const ANIMATION_DURATION = 300;

export function usePopupState(autoOpenOnLoad: boolean = false) {
  const [isVisible, setIsVisible] = useState(autoOpenOnLoad);
  const [isClosing, setIsClosing] = useState(false);

  const handleToggle = (isModelLoading: boolean, onClose?: () => void) => {
    if (!isModelLoading) {
      if (isVisible) {
        handleClose(onClose);
      } else {
        setIsVisible(true);
        setIsClosing(false);
      }
    }
  };

  const handleClose = (onClose?: () => void) => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose?.();
    }, ANIMATION_DURATION);
  };

  return {
    isVisible,
    isClosing,
    handleToggle,
    handleClose
  };
} 