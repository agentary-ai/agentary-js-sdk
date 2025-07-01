/**
 * URL utility functions for cleaning and normalizing URLs
 */

/**
 * Clean and normalize a URL for consistent API usage
 * @param url - The URL to clean
 * @returns The cleaned URL string
 */
export function cleanUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  try {
    // Remove leading/trailing whitespace
    let cleanedUrl = url.trim();

    // Handle protocol-relative URLs
    if (cleanedUrl.startsWith('//')) {
      cleanedUrl = 'https:' + cleanedUrl;
    }
    
    // Add protocol if missing (assume https)
    if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      cleanedUrl = 'https://' + cleanedUrl;
    }

    // Create URL object to parse and normalize
    const urlObj = new URL(cleanedUrl);

    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'msclkid', 'mc_cid', 'mc_eid',
      '_ga', '_gl', 'ref', 'source', 'campaign_id',
      'twclid', 'igshid', 'yclid'
    ];

    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });

    // Remove fragment (hash) as it's typically not needed for content identification
    urlObj.hash = '';

    // Ensure consistent casing for hostname
    urlObj.hostname = urlObj.hostname.toLowerCase();

    // Remove default ports
    if ((urlObj.protocol === 'https:' && urlObj.port === '443') ||
        (urlObj.protocol === 'http:' && urlObj.port === '80')) {
      urlObj.port = '';
    }

    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return the original trimmed URL
    // This handles edge cases where the URL might be malformed
    return url.trim();
  }
}

/**
 * Check if a URL is valid
 * @param url - The URL to validate
 * @returns True if the URL is valid, false otherwise
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    const cleanedUrl = url.trim();
    
    // Handle protocol-relative URLs
    let urlToTest = cleanedUrl;
    if (cleanedUrl.startsWith('//')) {
      urlToTest = 'https:' + cleanedUrl;
    } else if (!cleanedUrl.startsWith('http://') && !cleanedUrl.startsWith('https://')) {
      urlToTest = 'https://' + cleanedUrl;
    }

    new URL(urlToTest);
    return true;
  } catch {
    return false;
  }
} 