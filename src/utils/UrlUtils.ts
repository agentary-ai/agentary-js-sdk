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

    // Normalize www subdomain (remove www for consistency)
    if (urlObj.hostname.startsWith('www.')) {
      urlObj.hostname = urlObj.hostname.substring(4);
    }

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
 * Normalize a URL specifically for crawler deduplication and matching
 * This is more aggressive than cleanUrl and focuses on creating a canonical form
 * @param url - The URL to normalize
 * @returns The normalized URL string for comparison purposes
 */
export function normalizeUrlForMatching(url: string): string {
  const cleaned = cleanUrl(url);
  if (!cleaned) return '';

  try {
    const urlObj = new URL(cleaned);
    
    // Remove trailing slash from pathname (except for root)
    if (urlObj.pathname !== '/' && urlObj.pathname.endsWith('/')) {
      urlObj.pathname = urlObj.pathname.slice(0, -1);
    }
    
    // Sort query parameters for consistent comparison
    const sortedParams = new URLSearchParams();
    const paramNames = Array.from(urlObj.searchParams.keys()).sort();
    paramNames.forEach(name => {
      const values = urlObj.searchParams.getAll(name).sort();
      values.forEach(value => sortedParams.append(name, value));
    });
    
    urlObj.search = sortedParams.toString();
    
    return urlObj.toString();
  } catch (error) {
    return cleaned;
  }
}

/**
 * Check if two URLs are equivalent, accounting for www differences and other variations
 * @param url1 - First URL to compare
 * @param url2 - Second URL to compare
 * @returns True if the URLs are considered equivalent for crawling purposes
 */
export function areUrlsEquivalent(url1: string, url2: string): boolean {
  if (!url1 || !url2) return false;
  
  const normalized1 = normalizeUrlForMatching(url1);
  const normalized2 = normalizeUrlForMatching(url2);
  
  return normalized1 === normalized2;
}

/**
 * Check if a URL is already present in a collection, accounting for www differences
 * @param url - The URL to check
 * @param urlCollection - Array of URLs to check against
 * @returns True if an equivalent URL is found in the collection
 */
export function isUrlInCollection(url: string, urlCollection: string[]): boolean {
  const normalizedUrl = normalizeUrlForMatching(url);
  
  return urlCollection.some(collectionUrl => {
    const normalizedCollectionUrl = normalizeUrlForMatching(collectionUrl);
    return normalizedUrl === normalizedCollectionUrl;
  });
}

/**
 * Get the domain from a URL, with www normalization
 * @param url - The URL to extract domain from
 * @returns The normalized domain (without www)
 */
export function getDomain(url: string): string {
  try {
    const cleaned = cleanUrl(url);
    if (!cleaned) return '';
    
    const urlObj = new URL(cleaned);
    return urlObj.hostname; // Already normalized to remove www in cleanUrl
  } catch (error) {
    return '';
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