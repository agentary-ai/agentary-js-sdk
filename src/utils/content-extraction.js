/**
 * Utility functions for extracting content from webpages
 */

/**
 * Extract the main content from the current webpage
 * @returns The extracted text content
 */
export function extractPageContent() {
    // Get the page title
    const title = document.title;
    
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
    
    let mainContent = '';
    
    // Try each selector until we find content
    for (const selector of mainContentSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent && element.textContent.trim().length > 100) {
        mainContent = element.textContent.trim();
        break;
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
    
    return `${title}\n\n${mainContent}`;
  }