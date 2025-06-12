import { h } from 'preact';
import { useState } from 'preact/hooks';
import { classNames } from '../styles';

interface ContentPromptsProps {
  contentPrompts: string[];
  isGeneratingPrompts: boolean;
  showPrompts: boolean;
  isFadingOut: boolean;
  onPromptClick?: (prompt: string) => void;
}

export function ContentPrompts({ 
  contentPrompts, 
  isGeneratingPrompts, 
  showPrompts, 
  isFadingOut,
  onPromptClick
}: ContentPromptsProps) {
  const [isContentPromptsExpanded, setIsContentPromptsExpanded] = useState(false);

  if (isGeneratingPrompts) {
    return (
      <div className={classNames.contentPromptSection}>
        <div 
          className={isFadingOut ? classNames.fadeOut : ''}
          style={{ display: 'flex', justifyContent: 'center', padding: '5px' }}
        >
          <i className={`fas fa-spinner ${classNames.spinner}`}></i>
        </div>
      </div>
    );
  }

  if (!showPrompts) {
    return null;
  }

  return (
    <div className={classNames.contentPromptSection}>
      <div className={classNames.fadeIn}>
        <div className={classNames.promptPillsContainer}>
          {contentPrompts.slice(0, 2).map((prompt, index) => (
            <div 
              key={index} 
              className={classNames.contentPromptPill}
              onClick={() => onPromptClick?.(prompt)}
            >
              {prompt}
            </div>
          ))}
          
          {/* Expandable additional prompts */}
          {contentPrompts.length > 2 && (
            <div className={`${classNames.expandablePrompts} ${isContentPromptsExpanded ? classNames.expanded : ''}`}>
              {contentPrompts.slice(2).map((prompt, index) => (
                <div 
                  key={index + 2} 
                  className={classNames.contentPromptPill}
                  onClick={() => onPromptClick?.(prompt)}
                >
                  {prompt}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {contentPrompts.length > 2 && (
          <button
            className={classNames.contentPromptToggle}
            onClick={() => setIsContentPromptsExpanded(!isContentPromptsExpanded)}
          >
            <i className={`fas fa-chevron-${isContentPromptsExpanded ? 'up' : 'down'}`}></i>
            {isContentPromptsExpanded ? 'Show less' : `Show ${contentPrompts.length - 2} more`}
          </button>
        )}
      </div>
    </div>
  );
} 