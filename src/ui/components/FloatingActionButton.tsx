import { h } from 'preact';
import { classNames } from '../styles';

interface FloatingActionButtonProps {
  isVisible: boolean;
  isModelLoading: boolean;
  onClick: () => void;
}

export function FloatingActionButton({ isVisible, isModelLoading, onClick }: FloatingActionButtonProps) {
  if (isModelLoading) {
    return (
      <button
        disabled={true}
        className={classNames.floatingButton}
        title="Loading model..."
      >
        <i className={`fas fa-spinner ${classNames.spinner}`}></i>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isModelLoading}
      className={classNames.floatingButton}
      title={isVisible ? "Close Agentary" : "Open Agentary"}
    >
      <i className={`fas fa-${isVisible ? 'times' : 'wand-magic-sparkles'}`}></i>
    </button>
  );
} 