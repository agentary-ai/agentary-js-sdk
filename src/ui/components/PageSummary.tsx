import { h } from 'preact';
import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { classNames } from '../styles';

interface PageSummaryProps {
  summary: string;
  isGeneratingSummary: boolean;
  summaryError: string | null;
  showSummary: boolean;
}

export function PageSummary({ 
  summary, 
  isGeneratingSummary, 
  summaryError, 
  showSummary 
}: PageSummaryProps) {
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [hasUserScrolled, setHasUserScrolled] = useState(false);
  const summaryContentRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserScrollingRef = useRef(false);

  // Start auto-scroll when summary is shown
  useEffect(() => {
    if (summary && showSummary && !hasUserScrolled) {
      // Reset scroll position to top
      if (summaryContentRef.current) {
        summaryContentRef.current.scrollTop = 0;
      }
      
      // Start auto-scrolling after a short delay
      setTimeout(() => {
        setIsAutoScrolling(true);
      }, 1000);
    }
    
    // Cleanup on unmount or when summary is hidden
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [summary, showSummary, hasUserScrolled]);

  // Handle auto-scrolling
  useEffect(() => {
    if (isAutoScrolling && summaryContentRef.current) {
      const scrollElement = summaryContentRef.current;
      const scrollSpeed = 0.25; // pixels per frame (adjust for desired speed)
      
      autoScrollIntervalRef.current = setInterval(() => {
        // Stop if user has scrolled or reached bottom
        if (hasUserScrolled || !scrollElement) {
          if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
          }
          setIsAutoScrolling(false);
          return;
        }
        
        // Check if we've reached the bottom
        const isAtBottom = scrollElement.scrollTop + scrollElement.clientHeight >= scrollElement.scrollHeight - 1;
        
        if (isAtBottom) {
          if (autoScrollIntervalRef.current) {
            clearInterval(autoScrollIntervalRef.current);
            autoScrollIntervalRef.current = null;
          }
          setIsAutoScrolling(false);
        } else {
          // Continue scrolling
          scrollElement.scrollTop += scrollSpeed;
        }
      }, 16); // ~60fps
    }
    
    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [isAutoScrolling, hasUserScrolled]);

  // Check if summary content is scrollable and update scroll indicator
  const checkScrollable = useCallback(() => {
    const contentEl = summaryContentRef.current;
    if (!contentEl) return;

    const hasScrollableContent = contentEl.scrollHeight > contentEl.clientHeight;
    const isNotAtBottom = contentEl.scrollTop + contentEl.clientHeight < contentEl.scrollHeight - 5;
    
    setShowScrollIndicator(hasScrollableContent && isNotAtBottom);
  }, []);

  // Handle scroll events on summary content
  const handleSummaryScroll = useCallback(() => {
    checkScrollable();
    
    // Detect user scroll (not triggered by auto-scroll)
    if (!isUserScrollingRef.current && isAutoScrolling) {
      return;
    }
    
    // User is scrolling manually
    if (isAutoScrolling) {
      setHasUserScrolled(true);
      setIsAutoScrolling(false);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    }
  }, [checkScrollable, isAutoScrolling]);

  // Detect mouse wheel events for user scroll
  useEffect(() => {
    const contentEl = summaryContentRef.current;
    if (!contentEl) return;

    const handleWheel = () => {
      isUserScrollingRef.current = true;
      if (isAutoScrolling) {
        setHasUserScrolled(true);
        setIsAutoScrolling(false);
      }
      // Reset the flag after a short delay
      setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 100);
    };

    const handleTouchStart = () => {
      isUserScrollingRef.current = true;
      if (isAutoScrolling) {
        setHasUserScrolled(true);
        setIsAutoScrolling(false);
      }
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 100);
    };

    contentEl.addEventListener('wheel', handleWheel);
    contentEl.addEventListener('touchstart', handleTouchStart);
    contentEl.addEventListener('touchend', handleTouchEnd);

    return () => {
      contentEl.removeEventListener('wheel', handleWheel);
      contentEl.removeEventListener('touchstart', handleTouchStart);
      contentEl.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isAutoScrolling]);

  // Handle scroll indicator click
  const handleScrollIndicatorClick = () => {
    const contentEl = summaryContentRef.current;
    if (!contentEl) return;

    // Disable auto-scroll if it's active
    if (isAutoScrolling) {
      setHasUserScrolled(true);
      setIsAutoScrolling(false);
    }

    contentEl.scrollTo({
      top: contentEl.scrollHeight,
      behavior: 'smooth'
    });
  };

  // Check scrollability when summary content changes
  useEffect(() => {
    if (summary && showSummary) {
      // Small delay to ensure content is rendered
      setTimeout(checkScrollable, 100);
    }
  }, [summary, showSummary, checkScrollable]);

  // Reset user scroll flag when popup is closed and reopened
  useEffect(() => {
    if (!showSummary) {
      setHasUserScrolled(false);
    }
  }, [showSummary]);

  // Only render if there's summary content, loading state, or error
  if (!isGeneratingSummary && !showSummary && !summaryError) {
    return null;
  }

  return (
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
        <div className={`agentary-summary-container ${showSummary ? classNames.fadeIn : ''}`} style={{ position: 'relative' }}>
          <div 
            ref={summaryContentRef}
            className="agentary-summary-content"
            onScroll={handleSummaryScroll}
          >
            {summary}
            {isGeneratingSummary && (
              <span className={classNames.streamingCursor}>|</span>
            )}
          </div>
          
          {/* Auto-scroll indicator */}
          {isAutoScrolling && (
            <div 
              style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                fontSize: '11px',
                color: 'var(--agentary-text-muted)',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '4px 8px',
                borderRadius: '4px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <i className="fas fa-chevron-down" style={{ fontSize: '10px' }}></i>
              <span>Auto-scrolling</span>
            </div>
          )}
          
          {/* Discreet scroll indicator for summary */}
          {showScrollIndicator && !isAutoScrolling && (
            <div 
              className={classNames.summaryScrollIndicator}
              onClick={handleScrollIndicatorClick}
              title="Scroll to see more"
            >
              <i className="fas fa-chevron-down"></i>
            </div>
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
  );
} 