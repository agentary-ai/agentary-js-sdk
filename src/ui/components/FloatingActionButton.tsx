import { h } from 'preact';
import { classNames } from '../styles';
import { LogoSVG } from './Logo';

interface FloatingActionButtonProps {
  isVisible: boolean;
  isModelLoading: boolean;
  isReady: boolean;
  onClick: () => void;
}

export function FloatingActionButton({ isVisible, isModelLoading, isReady, onClick }: FloatingActionButtonProps) {
  const buttonClasses = [
    classNames.floatingButton,
    isReady && !isVisible ? classNames.floatingButtonReady : null
  ].filter(Boolean).join(' ');

  return (
    <div className={classNames.floatingButtonContainer}>
      {/* Speech bubble when popup is minimized and ready */}
      {!isVisible && isReady && !isModelLoading && (
        <div className={classNames.speechBubble}>
          <div className={classNames.speechBubbleContent}>
            Ready to help!
          </div>
          <div className={classNames.speechBubbleArrow}></div>
        </div>
      )}
      
      <button
        onClick={onClick}
        disabled={isModelLoading}
        className={buttonClasses}
        title={isModelLoading ? "Loading model..." : (isVisible ? "Close Agentary" : "Open Agentary")}
      >
        {isModelLoading ? (
          <i className={`fas fa-spinner ${classNames.spinner}`}></i>
        ) : isVisible ? (
          <i className="fas fa-times"></i>
        ) : (
          <LogoSVG />
        )}
      </button>
    </div>
  );
} 