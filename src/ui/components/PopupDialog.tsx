import { h } from 'preact';
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { classNames } from '../styles';
import { QuestionInput } from './QuestionInput';
import { RelatedArticlesCarousel } from './RelatedArticlesCarousel';
import type { RelatedArticlesService } from '../../core/services/RelatedArticlesService';
import type { WidgetOptions } from '../../types/index';
import type { SimilarPage } from '../../types/AgentaryClient';
import type { WebLLMClient } from '../../core/llm/WebLLMClient';
import type { Logger } from '../../utils/Logger';

interface PopupDialogProps {
  isClosing: boolean;
  contentPrompts: string[];
  isGeneratingPrompts: boolean;
  showPrompts: boolean;
  isFadingOut: boolean;
  onStartChat: (initialMessage?: string) => void;
  onRefreshPrompts?: () => void;
  relatedArticlesService?: RelatedArticlesService | undefined;
  widgetOptions: WidgetOptions;
  relatedArticles: SimilarPage[];
  isLoadingRelatedArticles: boolean;
  showRelatedArticlesFadeIn: boolean;
  webLLMClient: WebLLMClient;
  logger: Logger;
  summary: string;
  isGeneratingSummary: boolean;
  summaryError: string | null;
  showSummary: boolean;
}

export function PopupDialog({ 
  isClosing, 
  contentPrompts, 
  isGeneratingPrompts, 
  showPrompts, 
  isFadingOut,
  onStartChat,
  onRefreshPrompts,
  relatedArticlesService,
  widgetOptions,
  relatedArticles,
  isLoadingRelatedArticles,
  showRelatedArticlesFadeIn,
  webLLMClient,
  logger,
  summary,
  isGeneratingSummary,
  summaryError,
  showSummary
}: PopupDialogProps) {

  // Scroll indicator state
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Check if content is scrollable and update scroll indicator
  const checkScrollable = useCallback(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const hasScrollableContent = contentEl.scrollHeight > contentEl.clientHeight;
    const isNotAtBottom = contentEl.scrollTop + contentEl.clientHeight < contentEl.scrollHeight - 20;
    
    setShowScrollIndicator(hasScrollableContent && isNotAtBottom);
  }, []);

  // Handle scroll events
  const handleScroll = useCallback(() => {
    checkScrollable();
  }, [checkScrollable]);

  // Check scrollability on mount and when content changes
  useEffect(() => {
    checkScrollable();
    
    // Add resize observer to detect content changes
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const resizeObserver = new ResizeObserver(checkScrollable);
    resizeObserver.observe(contentEl);

    return () => {
      resizeObserver.disconnect();
    };
  }, [checkScrollable, summary, relatedArticles, isLoadingRelatedArticles]);

  // Handle scroll indicator click
  const handleScrollIndicatorClick = () => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    contentEl.scrollTo({
      top: contentEl.scrollHeight,
      behavior: 'smooth'
    });
  };



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
      <div 
        ref={contentRef}
        className={classNames.content}
        onScroll={handleScroll}
      >
        
        {/* Page Summary Section */}
        {(isGeneratingSummary || showSummary || summaryError) && (
          <div className={`${classNames.questionInputContainer}`}>            
            {isGeneratingSummary && !summary && (
              <div className="agentary-summary-loading">
                <i className={`fas fa-circle-notch ${classNames.spinner}`}></i>
                <span style={{ marginLeft: '8px', fontSize: '14px', color: 'var(--agentary-text-muted)' }}>
                  Generating summary...
                </span>
              </div>
            )}
            
            {summary && (
              <div className={`agentary-summary-content ${showSummary ? classNames.fadeIn : ''}`}>
                {summary}
                {isGeneratingSummary && (
                  <span className={classNames.streamingCursor}>|</span>
                )}
              </div>
            )}
            
            {summaryError && (
              <div className="agentary-summary-error">
                <i className="fas fa-exclamation-triangle" style={{ marginRight: '6px', color: '#dc3545' }}></i>
                {summaryError}
              </div>
            )}
          </div>
        )}

        <QuestionInput
          contentPrompts={contentPrompts}
          isGeneratingPrompts={isGeneratingPrompts}
          showPrompts={showPrompts}
          isFadingOut={isFadingOut}
          onStartChat={onStartChat}
          {...(onRefreshPrompts && { onRefreshPrompts })}
        />
        
        {/* General action prompts */}
        {/* <div className={classNames.promptPillsContainer}>
          <div 
            className={classNames.promptPill}
            onClick={() => onStartChat('Summarize this page')}
          >
            <i className="fas fa-book-open-reader"></i>
            Summarize this page
          </div>
        </div> */}
        {(isLoadingRelatedArticles || relatedArticles.length > 0) && (
          <div className={classNames.relatedArticlesWrapper}>
            <RelatedArticlesCarousel 
              relatedArticles={relatedArticles}
              isLoading={isLoadingRelatedArticles}
              showFadeIn={showRelatedArticlesFadeIn}
              widgetOptions={widgetOptions}
            />
          </div>
        )}
      </div>

      {/* Scroll Indicator */}
      {showScrollIndicator && (
        <div 
          className={classNames.scrollIndicator}
          onClick={handleScrollIndicatorClick}
        >
          <i className="fas fa-chevron-down"></i>
        </div>
      )}

      {/* Footer */}
      <div className={classNames.footer}>
        <div className={classNames.footerGradient}></div>
        Powered by Agentary
      </div>
    </div>
  );
} 