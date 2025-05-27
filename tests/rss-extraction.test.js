/**
 * RSS Extraction Tests
 * Tests for the RSS feed discovery functionality
 */

import { discoverRSSFeeds, findRSSFeeds, getBestRSSFeed } from '../src/utils/rss-extraction.js';

describe('RSS Feed Discovery', () => {
  // Mock fetch for testing
  global.fetch = jest.fn();

  beforeEach(() => {
    fetch.mockClear();
  });

  test('should discover RSS feeds from HTML link tags', async () => {
    const mockHTML = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" title="RSS Feed" href="/rss.xml">
          <link rel="alternate" type="application/atom+xml" title="Atom Feed" href="/atom.xml">
        </head>
        <body>
          <a href="/feed">RSS Feed</a>
        </body>
      </html>
    `;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHTML)
    });

    // Mock RSS feed validation
    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<?xml version="1.0"?><rss version="2.0"><channel><title>Test</title></channel></rss>')
    });

    const feeds = await discoverRSSFeeds('https://example.com');
    
    expect(feeds).toHaveLength(3); // 2 from link tags + 1 from anchor
    expect(feeds[0].url).toBe('https://example.com/rss.xml');
    expect(feeds[0].type).toBe('rss');
    expect(feeds[0].discoveryMethod).toBe('html-link-tag');
  });

  test('should find RSS feeds using simplified function', async () => {
    const mockHTML = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" href="/feed.xml">
        </head>
      </html>
    `;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHTML)
    });

    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>')
    });

    const feedUrls = await findRSSFeeds('https://example.com');
    
    expect(Array.isArray(feedUrls)).toBe(true);
    expect(feedUrls[0]).toBe('https://example.com/feed.xml');
  });

  test('should get best RSS feed', async () => {
    const mockHTML = `
      <html>
        <head>
          <link rel="alternate" type="application/rss+xml" title="Main Feed" href="/rss.xml">
        </head>
      </html>
    `;

    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockHTML)
    });

    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve('<?xml version="1.0"?><rss version="2.0"><channel><title>Best Feed</title></channel></rss>')
    });

    const bestFeed = await getBestRSSFeed('https://example.com');
    
    expect(bestFeed).not.toBeNull();
    expect(bestFeed.url).toBe('https://example.com/rss.xml');
    expect(bestFeed.title).toBe('Main Feed');
  });

  test('should handle errors gracefully', async () => {
    fetch.mockRejectedValue(new Error('Network error'));

    const feeds = await findRSSFeeds('https://invalid-url.com');
    expect(feeds).toEqual([]);

    const bestFeed = await getBestRSSFeed('https://invalid-url.com');
    expect(bestFeed).toBeNull();
  });

  test('should check common RSS paths', async () => {
    // Mock HTML response (no RSS links)
    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<html><head></head><body></body></html>')
    });

    // Mock successful RSS feed at common path
    fetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve('<?xml version="1.0"?><rss version="2.0"><channel></channel></rss>')
    });

    // Mock failed requests for other paths
    fetch.mockResolvedValue({
      ok: false,
      status: 404
    });

    const feeds = await discoverRSSFeeds('https://example.com');
    
    expect(feeds.length).toBeGreaterThan(0);
    expect(feeds[0].discoveryMethod).toBe('common-path');
  });
}); 