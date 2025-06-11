import { h } from 'preact';
import { classNames } from '../styles';
import { ContentPrompts } from './ContentPrompts';

interface QuestionInputProps {
  contentPrompts: string[];
  isGeneratingPrompts: boolean;
  showPrompts: boolean;
  isFadingOut: boolean;
}

export function QuestionInput({ 
  contentPrompts, 
  isGeneratingPrompts, 
  showPrompts, 
  isFadingOut 
}: QuestionInputProps) {
  return (
    <div className={classNames.questionInputContainer}>
      <div className={classNames.inputRow}>
        <input
          type="text"
          placeholder="What do you want to know?"
          className={classNames.questionInput}
        />
        <button
          className={classNames.sendButton}
          title="Send message"
        >
          <i className="fas fa-paper-plane"></i>
        </button>
      </div>
      
      <ContentPrompts
        contentPrompts={contentPrompts}
        isGeneratingPrompts={isGeneratingPrompts}
        showPrompts={showPrompts}
        isFadingOut={isFadingOut}
      />
    </div>
  );
} 