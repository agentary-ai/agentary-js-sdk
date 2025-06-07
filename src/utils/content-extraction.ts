/**
 * Utility functions for extracting content from webpages
 */

import { Logger } from "./Logger";

/**
 * Clean up extracted content by removing excessive whitespace and formatting artifacts
 */
function cleanupContent(content: string): string {
  if (!content) return '';
  
  return content
    // Remove excessive tabs and newlines
    .replace(/\t+/g, ' ')           // Replace multiple tabs with single space
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with max 2 newlines
    .replace(/\n{3,}/g, '\n\n')     // Limit consecutive newlines to 2
    .replace(/[ ]{2,}/g, ' ')       // Replace multiple spaces with single space
    .replace(/\n\s+/g, '\n')        // Remove leading spaces after newlines
    .replace(/\s+\n/g, '\n')        // Remove trailing spaces before newlines
    // Remove CSS and JavaScript artifacts
    .replace(/\{[^{}]*\}/g, '')     // Remove CSS-like blocks
    .replace(/\.[\w-]+\s*\{[^}]*\}/g, '') // Remove CSS rules
    .replace(/function\s*\([^)]*\)[^}]*\}/g, '') // Remove JavaScript functions
    .replace(/var\s+\w+\s*=\s*[^;]+;?/g, '') // Remove variable declarations
    .replace(/if\s*\([^)]*\)[^}]*\}/g, '') // Remove if statements
    .replace(/window\.\w+[^;]*;?/g, '') // Remove window object references
    .replace(/document\.\w+[^;]*;?/g, '') // Remove document object references
    // Remove common web artifacts
    .replace(/ADVERTISEMENT\s*/gi, '') // Remove advertisement markers
    .replace(/Skip Ad\s*/gi, '')       // Remove skip ad text
    .replace(/Continue watching\s*/gi, '') // Remove video player text
    .replace(/after the ad\s*/gi, '')  // Remove ad-related text
    .replace(/Visit Advertiser website\s*/gi, '') // Remove advertiser links
    .replace(/GO TO PAGE\s*/gi, '')    // Remove navigation text
    .replace(/Popular on \w+\s*/gi, '') // Remove "Popular on [site]" text
    .replace(/Related Stories\s*/gi, '') // Remove related stories headers
    .replace(/Read More About:\s*/gi, '') // Remove read more sections
    .replace(/Jump to Comments\s*/gi, '') // Remove jump to comments
    .replace(/VIP\+\s*/gi, '')           // Remove VIP+ indicators
    .replace(/SPOILER ALERT:\s*/gi, '')  // Remove spoiler alerts (keep the content)
    // Remove CSS class and ID references
    .replace(/class="[^"]*"/g, '')     // Remove class attributes
    .replace(/id="[^"]*"/g, '')        // Remove id attributes
    .replace(/style="[^"]*"/g, '')     // Remove inline styles
    // Remove common navigation and UI elements
    .replace(/\d+\/\d+\s*$/gm, '')      // Remove pagination like "1/1"
    .replace(/^\s*\d+\s*$/gm, '')       // Remove standalone numbers
    .replace(/^\s*[\d.]+\s*$/gm, '')    // Remove standalone decimal numbers
    // Remove HTML-like artifacts that might remain
    .replace(/<[^>]*>/g, '')           // Remove any remaining HTML tags
    .replace(/&\w+;/g, '')             // Remove HTML entities
    // Clean up remaining whitespace
    .trim()                             // Remove leading/trailing whitespace
    .replace(/\n\s*\n/g, '\n\n');       // Final cleanup of double newlines
}

/**
 * Rough token estimation (approximately 4 characters per token)
 */
// function estimateTokens(text: string): number {
//   return Math.ceil(text.length / 4);
// }

/**
 * Truncate content to fit within token limits
 */
function truncateContent(content: string, maxChars: number): string {
  if (content.length <= maxChars) {
    return content;
  }

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

interface ExtractPageContentOptions {
  maxChars?: number;
  contentSelector?: string | null;
}

/**
 * Extract the main content from the current webpage
 * @param {Object} options - Configuration options
 * @param {number} options.maxChars - Maximum number of characters to return (default: no limit)
 * @param {string} options.contentSelector - CSS selector for extracting article content
 * @returns The extracted text content
 */
export function extractPageContent(options: ExtractPageContentOptions = {}, logger: Logger): string {
    const { maxChars, contentSelector } = options;
    
    // Get the page title
    const title = document.title;
    
    let mainContent = '';
    
    // If a specific contentSelector is provided, use it
    if (contentSelector) {
      const element = document.querySelector(contentSelector);
      if (element && element.textContent) {
          mainContent = element.textContent.trim();
          logger.info("Found content using provided selector:", contentSelector);
      } else {
          logger.warn("No content found using provided selector:", contentSelector);
      }
    }
    
    // If no contentSelector provided or it didn't find content, use default selectors
    // if (!mainContent) {
    //   // Try to find the main content container
    //   // Attempt to find the main content by common selectors
    //   const mainContentSelectors = [
    //     'main', 
    //     'article', 
    //     '[role="main"]',
    //     '#content',
    //     '.content',
    //     '.main-content'
    //   ];
      
    //   // Try each selector until we find content
    //   for (const selector of mainContentSelectors) {
    //     const element = document.querySelector(selector);
    //     if (element && element.textContent && element.textContent.trim().length > 100) {
    //       mainContent = element.textContent.trim();
    //       logger.info("Found main content using selector:", selector);
    //       break;
    //     }
    //   }
    // }
    
    // If no main content found using selectors, use the whole body but exclude scripts, styles, etc.
    if (!mainContent) {
      // Clone body to avoid modifying the actual page
      const body = document.body.cloneNode(true) as Element;
      
      // Remove scripts, styles, and other non-content elements
      const elementsToRemove = body.querySelectorAll(`
        script, style, nav, footer, header, aside, 
        [role="banner"], [role="navigation"], [role="contentinfo"],
        .advertisement, .ad, .ads, .social-share, .comments,
        .related-articles, .sidebar, .popup, .modal,
        iframe, embed, object, video, audio,
        [class*="ad-"], [id*="ad-"], [class*="social"], 
        [class*="share"], [class*="comment"], [class*="related"]
      `);
      elementsToRemove.forEach((el: Element) => el.remove());
      
      mainContent = body.textContent?.trim() || '';
    }
    
    const fullContent = `${title}\n\n${mainContent}`;
    
    // Clean up the content to remove excessive whitespace and formatting artifacts
    const cleanedContent = cleanupContent(fullContent);
    
    // Apply truncation if maxChars is specified
    if (maxChars) {
      return truncateContent(cleanedContent, maxChars);
    }

    logger.debug("Extracted content length:", cleanedContent.length, "characters");
    
    return cleanedContent;
  }