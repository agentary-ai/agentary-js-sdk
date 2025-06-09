/**
 * Environment detection utilities
 */

export type DeviceType = 'desktop' | 'mobile' | 'tablet';
export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'edge' | 'opera';

/**
 * Detect the current device type based on user agent and screen size
 */
export function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') {
    return 'desktop'; // Default for server-side
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const screenWidth = window.screen.width;
  
  // Check for mobile indicators
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    // Distinguish between tablet and mobile based on screen size
    if (screenWidth >= 768) {
      return 'tablet';
    }
    return 'mobile';
  }
  
  // Check for tablet-specific indicators
  if (/ipad/i.test(userAgent) || (screenWidth >= 768 && screenWidth <= 1024)) {
    return 'tablet';
  }
  
  return 'desktop';
}

/**
 * Detect the current browser type based on user agent
 */
export function detectBrowserType(): BrowserType {
  if (typeof window === 'undefined') {
    return 'chrome'; // Default for server-side
  }

  const userAgent = navigator.userAgent.toLowerCase();
  
  // Check for Edge (must be before Chrome check)
  if (userAgent.includes('edg/') || userAgent.includes('edge/')) {
    return 'edge';
  }
  
  // Check for Chrome (must be before Safari check)
  if (userAgent.includes('chrome/') && !userAgent.includes('edg/')) {
    return 'chrome';
  }
  
  // Check for Firefox
  if (userAgent.includes('firefox/')) {
    return 'firefox';
  }
  
  // Check for Safari (must be after Chrome and Edge checks)
  if (userAgent.includes('safari/') && !userAgent.includes('chrome/') && !userAgent.includes('edg/')) {
    return 'safari';
  }
  
  // Check for Opera
  if (userAgent.includes('opr/') || userAgent.includes('opera/')) {
    return 'opera';
  }
  
  // Default fallback
  return 'chrome';
}

/**
 * Check if the current environment is allowed based on configuration
 */
export function isEnvironmentAllowed(
  allowedDevices?: DeviceType[],
  allowedBrowsers?: BrowserType[],
  disallowedDevices?: DeviceType[],
  disallowedBrowsers?: BrowserType[]
): boolean {
  const currentDevice = detectDeviceType();
  const currentBrowser = detectBrowserType();
  
  // Check disallowed lists first (they take precedence)
  if (disallowedDevices && disallowedDevices.includes(currentDevice)) {
    return false;
  }
  
  if (disallowedBrowsers && disallowedBrowsers.includes(currentBrowser)) {
    return false;
  }
  
  // Check allowed lists
  if (allowedDevices && !allowedDevices.includes(currentDevice)) {
    return false;
  }
  
  if (allowedBrowsers && !allowedBrowsers.includes(currentBrowser)) {
    return false;
  }
  
  return true;
}

/**
 * Get current environment information
 */
export function getCurrentEnvironment() {
  return {
    device: detectDeviceType(),
    browser: detectBrowserType(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'unknown',
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 0
  };
} 