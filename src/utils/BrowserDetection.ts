/**
 * Browser detection utilities
 */

/**
 * Detect if the current browser is Safari
 * @returns {boolean} True if the browser is Safari
 */
export function isSafari(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  
  const userAgent = navigator.userAgent;
  
  // Safari detection: contains Safari but not Chrome/Chromium
  const hasSafari = userAgent.includes('Safari');
  const hasChrome = userAgent.includes('Chrome') || userAgent.includes('Chromium');
  const hasEdge = userAgent.includes('Edge') || userAgent.includes('Edg/');
  
  return hasSafari && !hasChrome && !hasEdge;
}

/**
 * Detect if the current browser is Chrome or Chromium-based
 * @returns {boolean} True if the browser is Chrome or Chromium-based
 */
export function isChrome(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  
  const userAgent = navigator.userAgent;
  return userAgent.includes('Chrome') || userAgent.includes('Chromium');
}

/**
 * Detect if the current browser is Firefox
 * @returns {boolean} True if the browser is Firefox
 */
export function isFirefox(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  
  return navigator.userAgent.includes('Firefox');
}

/**
 * Detect if the current browser is Edge
 * @returns {boolean} True if the browser is Edge
 */
export function isEdge(): boolean {
  if (typeof navigator === 'undefined') {
    return false;
  }
  
  const userAgent = navigator.userAgent;
  return userAgent.includes('Edge') || userAgent.includes('Edg/');
}

/**
 * Get a simple browser name for logging/analytics
 * @returns {string} Browser name
 */
export function getBrowserName(): string {
  if (isSafari()) return 'Safari';
  if (isChrome()) return 'Chrome';
  if (isFirefox()) return 'Firefox';
  if (isEdge()) return 'Edge';
  return 'Unknown';
}

/**
 * Check if the browser supports Web Workers reliably
 * @returns {boolean} True if Web Workers are supported and reliable
 */
export function supportsWebWorkers(): boolean {
  return typeof Worker !== 'undefined';
}

/**
 * Check if the browser has known issues with Web Workers
 * Safari has some known issues with blob URLs for workers in certain contexts
 * @returns {boolean} True if the browser has known worker issues
 */
export function hasWebWorkerIssues(): boolean {
  return isSafari(); // Safari has known blob URL issues with workers
} 