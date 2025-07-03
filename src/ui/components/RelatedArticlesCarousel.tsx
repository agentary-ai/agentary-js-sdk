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
    const carouselElement = carouselRef.current;
    if (!carouselElement) return;

    let isScrolling = false;
    let scrollTimeout: NodeJS.Timeout;
    const totalArticles = Math.max(relatedArticles.length, 1); // Use actual number of articles, minimum 1

    const handleScroll = () => {
      const scrollLeft = carouselElement.scrollLeft;
      const containerWidth = carouselElement.clientWidth;
      const maxScrollLeft = carouselElement.scrollWidth - containerWidth;
      
      // Calculate current index
      let currentIndex = Math.round(scrollLeft / containerWidth);
      
      // Ensure index is within bounds
      currentIndex = Math.max(0, Math.min(currentIndex, totalArticles - 1));
      setActiveArticleIndex(currentIndex);

      // Mark as user interaction and pause auto-scroll
      setIsUserInteracting(true);
      clearTimeout(userInteractionTimerRef.current!);
      
      // Clear existing timeout
      clearTimeout(scrollTimeout);
      isScrolling = true;

      // Set timeout to detect when scrolling has stopped
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        
        // Resume auto-scroll after user stops interacting
        userInteractionTimerRef.current = setTimeout(() => {
          setIsUserInteracting(false);
        }, 2000); // Resume auto-scroll 2 seconds after user stops interacting
        
        // Only apply manual loop-back logic for user-initiated scrolls
        // Skip loop-back logic if this was likely an auto-scroll operation
        const tolerance = 10; // Small tolerance for floating point precision
        const isAtExactEnd = Math.abs(scrollLeft - maxScrollLeft) <= tolerance;
        const isAtExactBeginning = scrollLeft <= tolerance;
        
        // Only loop back if user manually scrolled beyond normal bounds
        // Auto-scroll should handle its own looping through the interval
        if (isAtExactEnd && isUserInteracting) {
          setTimeout(() => {
            carouselElement.scrollTo({
              left: 0,
              behavior: 'smooth'
            });
          }, 150); // Small delay to make the loop feel natural
        }
      }, 150); // Wait 150ms after scrolling stops
    };

    carouselElement.addEventListener('scroll', handleScroll);
    return () => {
      carouselElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
      clearTimeout(userInteractionTimerRef.current!);
    };
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    const carouselElement = carouselRef.current;
    if (!carouselElement) return;

    const startAutoScroll = () => {
      autoScrollTimerRef.current = setInterval(() => {
        // Only auto-scroll if user is not interacting
        if (!isUserInteracting) {
          const containerWidth = carouselElement.clientWidth;
          const currentScrollLeft = carouselElement.scrollLeft;
          const currentIndex = Math.round(currentScrollLeft / containerWidth);
          
          // Calculate next index (loop back to 0 after last article)
          const nextIndex = (currentIndex + 1) % Math.max(relatedArticles.length, 1);
          
          // Same timing for all transitions - no special handling
          carouselElement.scrollTo({
            left: nextIndex * containerWidth,
            behavior: 'smooth'
          });
        }
      }, 1000); // Auto-scroll every 2.5 seconds
    };

    // Start auto-scroll
    startAutoScroll();

    // Cleanup on unmount
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current);
      }
    };
  }, [isUserInteracting]); // Re-run when user interaction state changes

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
    <div className={classNames.relatedArticles}>
      <div 
        className={classNames.relatedArticlesCarousel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          ref={carouselRef}
          className={classNames.relatedArticlesContainer}
        >
          {isLoading ? (
            <>
              {/* Show 3 skeleton cards to mimic typical carousel */}
              {[...Array(3)].map((_, index) => (
                <div key={`skeleton-${index}`} className={classNames.skeletonArticle}>
                  <div className={classNames.skeletonArticleBg}>
                    <div className={classNames.skeletonContent}>
                      <div className={classNames.skeletonTitle}></div>
                      <div className={classNames.skeletonTitleShort}></div>
                      <div className={classNames.skeletonSource}></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : relatedArticles.length > 0 ? (
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
          ) : (
            <div className={`${classNames.relatedArticleCard} ${showFadeIn ? classNames.articlesFadeIn : ''}`}>
              <div 
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 123, 255, 0.1)',
                  borderRadius: 'var(--agentary-border-radius)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div 
                  className={classNames.relatedArticleContent}
                  style={{
                    position: 'static',
                    padding: '24px',
                    textAlign: 'center',
                    color: 'initial'
                  }}
                >
                  <div 
                    className={classNames.relatedArticleTitle}
                    style={{
                      color: '#666',
                      textShadow: 'none'
                    }}
                  >
                    No related articles found
                  </div>
                  <div 
                    className={classNames.relatedArticleSource}
                    style={{
                      color: '#666',
                      fontWeight: 400,
                      textShadow: 'none'
                    }}
                  >
                    Try browsing other content
                  </div>
                </div>
              </div>
            </div>
          )}
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
  );
} 