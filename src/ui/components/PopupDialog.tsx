import { h } from 'preact';
import { classNames } from '../styles';
import { QuestionInput } from './QuestionInput';
import { RelatedArticlesCarousel } from './RelatedArticlesCarousel';
import type { RelatedArticlesService } from '../../core/services/RelatedArticlesService';
import type { WidgetOptions } from '../../types/index';
import type { SimilarPage } from '../../types/AgentaryClient';

interface PopupDialogProps {
  isClosing: boolean;
  contentPrompts: string[];
  isGeneratingPrompts: boolean;
  showPrompts: boolean;
  isFadingOut: boolean;
  onStartChat: (initialMessage?: string) => void;
  relatedArticlesService?: RelatedArticlesService | undefined;
  widgetOptions: WidgetOptions;
  relatedArticles: SimilarPage[];
  isLoadingRelatedArticles: boolean;
  showRelatedArticlesFadeIn: boolean;
}

export function PopupDialog({ 
  isClosing, 
  contentPrompts, 
  isGeneratingPrompts, 
  showPrompts, 
  isFadingOut,
  onStartChat,
  relatedArticlesService,
  widgetOptions,
  relatedArticles,
  isLoadingRelatedArticles,
  showRelatedArticlesFadeIn
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
        {/* <div className={classNames.promptPillsContainer}>
          <div 
            className={classNames.promptPill}
            onClick={() => onStartChat('Summarize this page')}
          >
            <i className="fas fa-book-open-reader"></i>
            Summarize this page
          </div>
        </div> */}

        {/* Related Articles Carousel */}
        <RelatedArticlesCarousel 
          relatedArticles={relatedArticles}
          isLoading={isLoadingRelatedArticles}
          showFadeIn={showRelatedArticlesFadeIn}
          widgetOptions={widgetOptions}
        />
      </div>

      {/* Footer */}
      <div className={classNames.footer}>
        Powered by Agentary
      </div>
    </div>
  );
} 