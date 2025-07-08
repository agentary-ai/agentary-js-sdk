import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { classNames } from '../styles';
import type { WidgetOptions } from '../../types/index';
import type { SimilarPage } from '../../types/AgentaryClient';

interface RelatedArticlesCarouselProps {
  relatedArticles: SimilarPage[];
  isLoading: boolean;
  showFadeIn: boolean;
  widgetOptions: WidgetOptions;
}

export function RelatedArticlesCarousel({ 
  relatedArticles,
  isLoading,
  showFadeIn,
  widgetOptions 
}: RelatedArticlesCarouselProps) {
  const [activeArticleIndex, setActiveArticleIndex] = useState(0);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const autoScrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const userInteractionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle scroll events to update active dot and implement looping
  useEffect(() => {
    // Attach the scroll listener once the carousel (and articles) are rendered
    const carouselElement = carouselRef.current;
    if (isLoading || !carouselElement) return;

    let scrollTimeout: NodeJS.Timeout;
    const totalArticles = Math.max(relatedArticles.length, 1);

    const handleScroll = () => {
      const scrollLeft = carouselElement.scrollLeft;
      const containerWidth = carouselElement.clientWidth;
      const maxScrollLeft = carouselElement.scrollWidth - containerWidth;

      // Calculate current index based on scroll position
      let currentIndex = Math.round(scrollLeft / containerWidth);
      currentIndex = Math.max(0, Math.min(currentIndex, totalArticles - 1));
      setActiveArticleIndex(currentIndex);

      // Pause auto-scroll while the user is interacting
      setIsUserInteracting(true);
      clearTimeout(userInteractionTimerRef.current!);

      // Debounce to detect when scrolling has stopped
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        // Resume auto-scroll 2 s after user stops
        userInteractionTimerRef.current = setTimeout(() => {
          setIsUserInteracting(false);
        }, 2000);

        // Optional loop-back logic when user reaches the end
        const tolerance = 10;
        const isAtExactEnd = Math.abs(scrollLeft - maxScrollLeft) <= tolerance;
        if (isAtExactEnd) {
          setTimeout(() => {
            carouselElement.scrollTo({ left: 0, behavior: 'smooth' });
          }, 150);
        }
      }, 150);
    };

    carouselElement.addEventListener('scroll', handleScroll);

    return () => {
      carouselElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      clearTimeout(userInteractionTimerRef.current!);
    };
  }, [isLoading, relatedArticles.length]);

  // Auto-scroll functionality
  useEffect(() => {
    // Don't start auto-scroll until loading completes and we have at least one article rendered
    if (isLoading) return;

    const carouselElement = carouselRef.current;
    if (!carouselElement) return;

    // Start or restart auto-scroll
    autoScrollTimerRef.current = setInterval(() => {
      // Only auto-scroll if user is not currently interacting
      if (!isUserInteracting) {
        const containerWidth = carouselElement.clientWidth;
        const currentScrollLeft = carouselElement.scrollLeft;
        const currentIndex = Math.round(currentScrollLeft / containerWidth);

        // Determine next index and scroll
        const nextIndex = (currentIndex + 1) % Math.max(relatedArticles.length, 1);
        carouselElement.scrollTo({ left: nextIndex * containerWidth, behavior: 'smooth' });

        // Keep the dot indicator in sync
        setActiveArticleIndex(nextIndex);
      }
    }, 1500);

    // Cleanup when deps change/unmount
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isUserInteracting, isLoading, relatedArticles.length]);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
      if (userInteractionTimerRef.current) {
        clearTimeout(userInteractionTimerRef.current);
      }
    };
  }, []);

  // Handle dot click navigation with smart looping
  const handleDotClick = (index: number) => {
    const carouselElement = carouselRef.current;
    if (!carouselElement) return;

    // Pause auto-scroll when user clicks dots
    setIsUserInteracting(true);
    clearTimeout(userInteractionTimerRef.current!);
    
    // Resume auto-scroll after user interaction
    userInteractionTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 3000); // Give user 3 seconds before resuming auto-scroll

    const containerWidth = carouselElement.clientWidth;
    const currentScrollLeft = carouselElement.scrollLeft;
    const currentIndex = Math.round(currentScrollLeft / containerWidth);
    
    // Determine the most efficient path to the target
    let targetScrollLeft = index * containerWidth;
    
    // If clicking on first dot from last position, consider looping
    if (currentIndex === 2 && index === 0) {
      // For a smooth user experience, just scroll normally
      // The auto-loop will handle the infinite scroll feeling
      targetScrollLeft = 0;
    }
    // If clicking on last dot from first position  
    else if (currentIndex === 0 && index === 2) {
      targetScrollLeft = index * containerWidth;
    }

    carouselElement.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    });
    setActiveArticleIndex(index);
  };

  // Handle mouse enter/leave to pause auto-scroll on hover
  const handleMouseEnter = () => {
    setIsUserInteracting(true);
    clearTimeout(userInteractionTimerRef.current!);
  };

  const handleMouseLeave = () => {
    // Resume auto-scroll after mouse leaves
    userInteractionTimerRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, 1000); // Resume auto-scroll 1 second after mouse leaves
  };

  // Handle article click to open in new tab
  const handleArticleClick = (article: SimilarPage) => {
    if (article.url) {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {isLoading ? (
        <>
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            gap: '10px'
          }}>
            <i className={`fas fa-spinner ${classNames.spinner}`}></i>
            <div>Finding related content</div>
          </div>
        </>
      ) : relatedArticles.length === 0 ? (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          gap: '10px'
        }}>
          <div>No related content found</div>
        </div>
      ) : (
        <div className={classNames.relatedArticles}>
          <div>
            View related articles
          </div>
          <div 
            className={classNames.relatedArticlesCarousel}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div 
              ref={carouselRef}
              className={classNames.relatedArticlesContainer}
            >
              <>
                {relatedArticles.map((article, index) => (
                  <div 
                    key={article.url || index} 
                    className={`${classNames.relatedArticleCard} ${showFadeIn ? classNames.articlesFadeIn : ''}`}
                    onClick={() => handleArticleClick(article)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div 
                      className={classNames.relatedArticleImageBg}
                      style={{
                        backgroundImage: article.main_image_url ? `url(${article.main_image_url})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    >
                      <div className={classNames.relatedArticleOverlay}></div>
                      <div className={classNames.relatedArticleContent}>
                        <div className={classNames.relatedArticleTitle}>
                          {article.content_metadata.title || 'Untitled Article'}
                        </div>
                        {article.short_summary && (
                          <div className={classNames.relatedArticleSummary}>
                            {article.short_summary}
                          </div>
                        )}
                        <div className={classNames.relatedArticleSource}>
                          {article.site_name || article.domain || 'Unknown Source'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            </div>
            <div className={classNames.relatedArticlesNavigation}>
              <div className={classNames.relatedArticlesDots}>
                {(!isLoading && relatedArticles.length > 1) && relatedArticles.map((_, index) => (
                  <div 
                    key={index}
                    className={`${classNames.relatedArticlesDot} ${activeArticleIndex === index ? classNames.active : ''}`}
                    onClick={() => handleDotClick(index)}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}