import { h } from 'preact';
import { useState } from 'preact/hooks';
import { classNames } from '../styles';

interface ContentPromptsProps {
  contentPrompts: string[];
  isGeneratingPrompts: boolean;
  showPrompts: boolean;
  isFadingOut: boolean;
  onPromptClick?: (prompt: string) => void;
  onRefresh?: () => void;
}

export function ContentPrompts({ 
  contentPrompts, 
  isGeneratingPrompts, 
  showPrompts, 
  isFadingOut,
  onPromptClick,
  onRefresh
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
        
        {/* Button row with Show More/Less and Refresh */}
        {(contentPrompts.length > 2 || onRefresh) && (
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            alignItems: 'center',
            justifyContent: contentPrompts.length > 2 ? 'space-between' : 'flex-end'
          }}>
            {contentPrompts.length > 2 && (
              <button
                className={classNames.contentPromptToggle}
                onClick={() => setIsContentPromptsExpanded(!isContentPromptsExpanded)}
                style={{ flex: '1' }}
              >
                <i className={`fas fa-chevron-${isContentPromptsExpanded ? 'up' : 'down'}`}></i>
                {isContentPromptsExpanded ? 'Show less' : `Show ${contentPrompts.length - 2} more`}
              </button>
            )}
            
            {onRefresh && (
              <button
                onClick={onRefresh}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--agentary-border-color)',
                  color: 'var(--agentary-text-muted)',
                  cursor: 'pointer',
                  padding: 'var(--agentary-spacing-sm) var(--agentary-spacing-md)',
                  borderRadius: 'var(--agentary-border-radius-small)',
                  fontSize: 'var(--agentary-font-size-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all var(--agentary-transition-fast)',
                  fontFamily: 'inherit',
                  fontWeight: '500',
                  minWidth: 'fit-content'
                }}
                title="Refresh prompts"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--agentary-primary-color)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.borderColor = 'var(--agentary-primary-color)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--agentary-text-muted)';
                  e.currentTarget.style.borderColor = 'var(--agentary-border-color)';
                }}
              >
                <i className="fas fa-sync-alt"></i>
                Refresh
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 