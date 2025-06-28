import { h } from 'preact';
import { classNames } from '../styles';
import { QuestionInput } from './QuestionInput';

interface PopupDialogProps {
  isClosing: boolean;
  contentPrompts: string[];
  isGeneratingPrompts: boolean;
  showPrompts: boolean;
  isFadingOut: boolean;
  onStartChat: (initialMessage?: string) => void;
}

export function PopupDialog({ 
  isClosing, 
  contentPrompts, 
  isGeneratingPrompts, 
  showPrompts, 
  isFadingOut,
  onStartChat
}: PopupDialogProps) {
  const getPopupClassName = () => {
    const classes = [classNames.popup];
    if (isClosing) {
      classes.push(classNames.fadeOut);
    } else {
      classes.push(classNames.slideIn);
    }
    return classes.join(' ');
  };

  return (
    <div className={getPopupClassName()}>
      {/* Content */}
      <div className={classNames.content}>
        <QuestionInput
          contentPrompts={contentPrompts}
          isGeneratingPrompts={isGeneratingPrompts}
          showPrompts={showPrompts}
          isFadingOut={isFadingOut}
          onStartChat={onStartChat}
        />
        
        {/* General action prompts */}
        <div className={classNames.promptPillsContainer}>
          <div 
            className={classNames.promptPill}
            onClick={() => onStartChat('Summarize this page')}
          >
            <i className="fas fa-book-open-reader"></i>
            Summarize this page
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={classNames.footer}>
        Powered by Agentary
      </div>
    </div>
  );
} 