import { useState, useEffect } from 'preact/hooks';
import type { RelatedArticlesService } from '../../core/services/RelatedArticlesService';
import type { WidgetOptions } from '../../types/index';
import type { SimilarPage } from '../../types/AgentaryClient';

interface UseRelatedArticlesOptions {
  relatedArticlesService?: RelatedArticlesService | undefined;
  widgetOptions: WidgetOptions;
  isVisible: boolean;
  isClientReady: boolean;
}

export function useRelatedArticles({ 
  relatedArticlesService, 
  widgetOptions, 
  isVisible, 
  isClientReady 
}: UseRelatedArticlesOptions) {
  const [relatedArticles, setRelatedArticles] = useState<SimilarPage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFadeIn, setShowFadeIn] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Fetch related articles when client is ready
  useEffect(() => {
    // Only fetch articles when:
    // 1. The client is ready
    // 2. We haven't already fetched articles
    // 3. We have a related articles service
    if (isClientReady && !hasFetched && relatedArticlesService) {
      setIsLoading(true);
      setShowFadeIn(false);
      
      const fetchOptions: any = {};
      if (widgetOptions.contentSelector) {
        fetchOptions.contentSelector = widgetOptions.contentSelector;
      }
      
      relatedArticlesService.getSimilarPages(fetchOptions)
        .then(articles => {
          setRelatedArticles(articles);
          setIsLoading(false);
          setHasFetched(true);
          // Trigger fade-in animation after a short delay
          setTimeout(() => {
            setShowFadeIn(true);
          }, 50);
        })
        .catch(error => {
          console.error('Failed to fetch related articles:', error);
          setIsLoading(false);
          setHasFetched(true);
          // Trigger fade-in animation even on error
          setTimeout(() => {
            setShowFadeIn(true);
          }, 50);
        });
    }
  }, [isClientReady, hasFetched, relatedArticlesService, widgetOptions.contentSelector]);

  // Keep articles persisted across widget open/close cycles
  // Articles will only be reset on page refresh/navigation
  // Only reset showFadeIn when popup is closed to ensure proper animation on reopen
  useEffect(() => {
    if (!isVisible) {
      setShowFadeIn(false);
    }
  }, [isVisible]);

  return {
    relatedArticles,
    isLoading,
    showFadeIn,
    hasFetched
  };
} 