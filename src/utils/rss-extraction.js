/**
 * RSS Feed Discovery Utility
 * Provides methods to discover RSS feeds from websites using multiple strategies
 */

/**
 * Discovers RSS feeds from a given website URL
 * @param {string} url - The website URL to search for RSS feeds
 * @param {Object} options - Configuration options
 * @param {number} options.timeout - Request timeout in milliseconds (default: 10000)
 * @param {boolean} options.followRedirects - Whether to follow redirects (default: true)
 * @param {Array<string>} options.userAgents - Array of user agents to try (default: standard browser UA)
 * @returns {Promise<Array<Object>>} Array of discovered RSS feed objects
 */
export async function discoverRSSFeeds(url, options = {}) {
  const {
    timeout = 10000,
    followRedirects = true,
    userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ]
  } = options;

  const feeds = new Set();
  const baseUrl = new URL(url);

  try {
    // Strategy 1: Parse HTML for RSS feed links
    const htmlFeeds = await findRSSInHTML(url, { timeout, userAgents });
    htmlFeeds.forEach(feed => feeds.add(JSON.stringify(feed)));

    // Strategy 2: Check common RSS feed paths
    const commonFeeds = await checkCommonRSSPaths(baseUrl, { timeout, userAgents });
    commonFeeds.forEach(feed => feeds.add(JSON.stringify(feed)));

    // Strategy 3: Check robots.txt for sitemap, then parse sitemap for RSS
    const robotsFeeds = await findRSSFromRobots(baseUrl, { timeout, userAgents });
    robotsFeeds.forEach(feed => feeds.add(JSON.stringify(feed)));

    // Convert back to objects and remove duplicates
    const uniqueFeeds = Array.from(feeds).map(feed => JSON.parse(feed));
    
    // Validate and enrich feed information
    const validatedFeeds = await validateFeeds(uniqueFeeds, { timeout, userAgents });
    
    return validatedFeeds;
  } catch (error) {
    throw new Error(`Failed to discover RSS feeds: ${error.message}`);
  }
}

/**
 * Strategy 1: Parse HTML content to find RSS feed links
 * @param {string} url - The website URL
 * @param {Object} options - Request options
 * @returns {Promise<Array<Object>>} Array of RSS feed objects found in HTML
 */
async function findRSSInHTML(url, options) {
  const feeds = [];
  
  try {
    const html = await fetchWithRetry(url, options);
    
    // Parse HTML to find RSS/Atom feed links
    const feedLinkRegex = /<link[^>]*(?:type=["']application\/(?:rss\+xml|atom\+xml)["'][^>]*href=["']([^"']+)["']|href=["']([^"']+)["'][^>]*type=["']application\/(?:rss\+xml|atom\+xml)["'])[^>]*>/gi;
    
    let match;
    while ((match = feedLinkRegex.exec(html)) !== null) {
      const feedUrl = match[1] || match[2];
      if (feedUrl) {
        const absoluteUrl = new URL(feedUrl, url).href;
        
        // Extract title if available
        const titleMatch = match[0].match(/title=["']([^"']+)["']/i);
        const title = titleMatch ? titleMatch[1] : null;
        
        // Determine feed type
        const type = match[0].includes('atom') ? 'atom' : 'rss';
        
        feeds.push({
          url: absoluteUrl,
          title: title || `${type.toUpperCase()} Feed`,
          type: type,
          discoveryMethod: 'html-link-tag'
        });
      }
    }

    // Also look for common RSS link patterns in anchor tags
    const anchorRegex = /<a[^>]*href=["']([^"']*(?:rss|feed|atom)[^"']*)["'][^>]*>([^<]*)<\/a>/gi;
    while ((match = anchorRegex.exec(html)) !== null) {
      const feedUrl = match[1];
      const linkText = match[2].trim();
      
      if (feedUrl && (feedUrl.includes('rss') || feedUrl.includes('feed') || feedUrl.includes('atom'))) {
        const absoluteUrl = new URL(feedUrl, url).href;
        feeds.push({
          url: absoluteUrl,
          title: linkText || 'RSS Feed',
          type: 'rss',
          discoveryMethod: 'html-anchor-tag'
        });
      }
    }
    
  } catch (error) {
    console.warn(`Failed to parse HTML for RSS feeds: ${error.message}`);
  }
  
  return feeds;
}

/**
 * Strategy 2: Check common RSS feed paths
 * @param {URL} baseUrl - The base URL object
 * @param {Object} options - Request options
 * @returns {Promise<Array<Object>>} Array of RSS feed objects found at common paths
 */
async function checkCommonRSSPaths(baseUrl, options) {
  const commonPaths = [
    '/rss',
    '/rss.xml',
    '/feed',
    '/feed.xml',
    '/feeds',
    '/feeds.xml',
    '/atom.xml',
    '/index.xml',
    '/blog/rss',
    '/blog/feed',
    '/blog/rss.xml',
    '/blog/feed.xml',
    '/news/rss',
    '/news/feed',
    '/rss/index.xml',
    '/feed/index.xml'
  ];
  
  const feeds = [];
  
  for (const path of commonPaths) {
    try {
      const feedUrl = new URL(path, baseUrl).href;
      const isValid = await validateRSSFeed(feedUrl, options);
      
      if (isValid) {
        feeds.push({
          url: feedUrl,
          title: `RSS Feed (${path})`,
          type: path.includes('atom') ? 'atom' : 'rss',
          discoveryMethod: 'common-path'
        });
      }
    } catch (error) {
      // Silently continue to next path
      continue;
    }
  }
  
  return feeds;
}

/**
 * Strategy 3: Find RSS feeds through robots.txt and sitemaps
 * @param {URL} baseUrl - The base URL object
 * @param {Object} options - Request options
 * @returns {Promise<Array<Object>>} Array of RSS feed objects found through robots.txt
 */
async function findRSSFromRobots(baseUrl, options) {
  const feeds = [];
  
  try {
    const robotsUrl = new URL('/robots.txt', baseUrl).href;
    const robotsContent = await fetchWithRetry(robotsUrl, options);
    
    // Extract sitemap URLs from robots.txt
    const sitemapRegex = /sitemap:\s*(.+)/gi;
    let match;
    
    while ((match = sitemapRegex.exec(robotsContent)) !== null) {
      const sitemapUrl = match[1].trim();
      
      try {
        // Check if sitemap itself is an RSS feed or contains RSS references
        const sitemapContent = await fetchWithRetry(sitemapUrl, options);
        
        if (isRSSContent(sitemapContent)) {
          feeds.push({
            url: sitemapUrl,
            title: 'RSS Feed (from sitemap)',
            type: sitemapContent.includes('<feed') ? 'atom' : 'rss',
            discoveryMethod: 'robots-sitemap'
          });
        }
      } catch (error) {
        // Continue to next sitemap
        continue;
      }
    }
  } catch (error) {
    // robots.txt not found or inaccessible
  }
  
  return feeds;
}

/**
 * Validates RSS feeds and enriches them with additional information
 * @param {Array<Object>} feeds - Array of feed objects to validate
 * @param {Object} options - Request options
 * @returns {Promise<Array<Object>>} Array of validated and enriched feed objects
 */
async function validateFeeds(feeds, options) {
  const validFeeds = [];
  
  for (const feed of feeds) {
    try {
      const isValid = await validateRSSFeed(feed.url, options);
      if (isValid) {
        // Try to get additional metadata
        const metadata = await getRSSMetadata(feed.url, options);
        validFeeds.push({
          ...feed,
          ...metadata,
          validated: true,
          lastChecked: new Date().toISOString()
        });
      }
    } catch (error) {
      // Feed is invalid, skip it
      continue;
    }
  }
  
  return validFeeds;
}

/**
 * Validates if a URL contains a valid RSS/Atom feed
 * @param {string} url - The feed URL to validate
 * @param {Object} options - Request options
 * @returns {Promise<boolean>} True if valid RSS/Atom feed
 */
async function validateRSSFeed(url, options) {
  try {
    const content = await fetchWithRetry(url, { ...options, timeout: 5000 });
    return isRSSContent(content);
  } catch (error) {
    return false;
  }
}

/**
 * Checks if content is valid RSS/Atom XML
 * @param {string} content - The content to check
 * @returns {boolean} True if content appears to be RSS/Atom
 */
function isRSSContent(content) {
  if (!content || typeof content !== 'string') return false;
  
  const trimmed = content.trim();
  
  // Check for RSS/Atom XML structure
  const rssPatterns = [
    /<rss\s+version/i,
    /<feed\s+xmlns/i,
    /<rdf:RDF/i,
    /<channel>/i,
    /<entry>/i
  ];
  
  return rssPatterns.some(pattern => pattern.test(trimmed));
}

/**
 * Extracts metadata from RSS feed content
 * @param {string} url - The feed URL
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Feed metadata object
 */
async function getRSSMetadata(url, options) {
  try {
    const content = await fetchWithRetry(url, { ...options, timeout: 5000 });
    
    const metadata = {
      description: null,
      language: null,
      lastBuildDate: null,
      itemCount: 0
    };
    
    // Extract title (if not already set)
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      metadata.feedTitle = titleMatch[1].trim();
    }
    
    // Extract description
    const descMatch = content.match(/<description[^>]*>([^<]+)<\/description>/i);
    if (descMatch) {
      metadata.description = descMatch[1].trim();
    }
    
    // Extract language
    const langMatch = content.match(/<language[^>]*>([^<]+)<\/language>/i);
    if (langMatch) {
      metadata.language = langMatch[1].trim();
    }
    
    // Extract last build date
    const dateMatch = content.match(/<lastBuildDate[^>]*>([^<]+)<\/lastBuildDate>/i);
    if (dateMatch) {
      metadata.lastBuildDate = dateMatch[1].trim();
    }
    
    // Count items
    const itemMatches = content.match(/<item[^>]*>/gi) || content.match(/<entry[^>]*>/gi);
    if (itemMatches) {
      metadata.itemCount = itemMatches.length;
    }
    
    return metadata;
  } catch (error) {
    return {};
  }
}

/**
 * Fetches content with retry logic and user agent rotation
 * @param {string} url - The URL to fetch
 * @param {Object} options - Request options
 * @returns {Promise<string>} The fetched content
 */
async function fetchWithRetry(url, options) {
  const { timeout = 10000, userAgents = [] } = options;
  const maxRetries = userAgents.length || 1;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const userAgent = userAgents[i] || userAgents[0] || 'Mozilla/5.0 (compatible; RSS-Discovery-Bot/1.0)';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.text();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

/**
 * Simplified RSS discovery for quick checks
 * @param {string} url - The website URL
 * @returns {Promise<Array<string>>} Array of RSS feed URLs
 */
export async function findRSSFeeds(url) {
  try {
    const feeds = await discoverRSSFeeds(url);
    return feeds.map(feed => feed.url);
  } catch (error) {
    console.error('RSS discovery failed:', error.message);
    return [];
  }
}

/**
 * Get the best RSS feed from a website (returns the first valid one found)
 * @param {string} url - The website URL
 * @returns {Promise<Object|null>} The best RSS feed object or null if none found
 */
export async function getBestRSSFeed(url) {
  try {
    const feeds = await discoverRSSFeeds(url);
    return feeds.length > 0 ? feeds[0] : null;
  } catch (error) {
    console.error('RSS discovery failed:', error.message);
    return null;
  }
}
