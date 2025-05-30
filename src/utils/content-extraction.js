/**
 * Utility functions for extracting content from webpages
 */

/**
 * Rough token estimation (approximately 4 characters per token)
 */
function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

/**
 * Truncate content to fit within token limits
 */
function truncateContent(content, maxTokens) {
  const tokens = estimateTokens(content);
  if (tokens <= maxTokens) {
    return content;
  }
  
  // Truncate to approximate character limit (maxTokens * 4 characters per token)
  const maxChars = maxTokens * 4;
  const truncated = content.substring(0, maxChars);
  
  // Try to truncate at a sentence boundary to maintain readability
  const lastSentenceEnd = Math.max(
    truncated.lastIndexOf('.'),
    truncated.lastIndexOf('!'),
    truncated.lastIndexOf('?')
  );
  
  if (lastSentenceEnd > maxChars * 0.8) {
    return truncated.substring(0, lastSentenceEnd + 1);
  }
  
  return truncated + '...';
}

/**
 * Extract the main content from the current webpage
 * @param {Object} options - Configuration options
 * @param {number} options.maxTokens - Maximum number of tokens to return (default: no limit)
 * @param {string} options.contentSelector - CSS selector for extracting article content
 * @returns The extracted text content
 */
export function extractPageContent(options = {}) {
    const { maxTokens, contentSelector } = options;
    
    // Get the page title
    const title = document.title;
    
    let mainContent = '';
    
    // If a specific contentSelector is provided, use it
    if (contentSelector) {
        const element = document.querySelector(contentSelector);
        if (element && element.textContent) {
            mainContent = element.textContent.trim();
            console.log("Found content using provided selector:", contentSelector);
        } else {
            console.warn("No content found using provided selector:", contentSelector);
        }
    }
    
    // If no contentSelector provided or it didn't find content, use default selectors
    if (!mainContent) {
        // Try to find the main content container
        // Attempt to find the main content by common selectors
        const mainContentSelectors = [
          'main', 
          'article', 
          '[role="main"]',
          '#content',
          '.content',
          '.main-content'
        ];
        
        // Try each selector until we find content
        for (const selector of mainContentSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent && element.textContent.trim().length > 100) {
            mainContent = element.textContent.trim();
            console.log("Found main content using selector:", selector);
            break;
          }
        }
    }
    
    // If no main content found using selectors, use the whole body but exclude scripts, styles, etc.
    if (!mainContent) {
      // Clone body to avoid modifying the actual page
      const body = document.body.cloneNode(true);
      
      // Remove scripts, styles, and other non-content elements
      const elementsToRemove = body.querySelectorAll('script, style, nav, footer, header, aside, [role="banner"], [role="navigation"]');
      elementsToRemove.forEach(el => el.remove());
      
      mainContent = body.textContent?.trim() || '';
    }
    
    const fullContent = `${title}\n\n${mainContent}`;
    
    // Apply truncation if maxTokens is specified
    if (maxTokens) {
      return truncateContent(fullContent, maxTokens);
    }
    
    return fullContent;
  }