import { h } from 'preact';
import { useState, useRef, useEffect } from 'preact/hooks';
import { classNames } from '../styles';
import { ContentPrompts } from './ContentPrompts';

interface QuestionInputProps {
  contentPrompts: string[];
  isGeneratingPrompts: boolean;
  showPrompts: boolean;
  isFadingOut: boolean;
  onStartChat: (initialMessage?: string) => void;
}

export function QuestionInput({ 
  contentPrompts, 
  isGeneratingPrompts, 
  showPrompts, 
  isFadingOut,
  onStartChat
}: QuestionInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when component mounts
  useEffect(() => {
    // Delay focus until after the popup animation completes (300ms)
    const focusTimeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 350); // Slightly longer than animation duration
    
    return () => clearTimeout(focusTimeout);
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    onStartChat(inputValue.trim());
  };

  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePromptClick = (prompt: string) => {
    onStartChat(prompt);
  };
  return (
    <div className={classNames.questionInputContainer}>
      <div className={classNames.inputRow}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.currentTarget.value)}
          onKeyDown={handleKeyPress}
          placeholder="What do you want to know?"
          className={classNames.questionInput}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputValue.trim()}
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
        onPromptClick={handlePromptClick}
      />
    </div>
  );
} 