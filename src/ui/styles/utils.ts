/**
 * Style injection utilities
 */
import { cssVariables } from './variables';

const AGENTARY_STYLE_ID = 'agentary-widget-styles';

/**
 * Inject styles into the document head
 */
export function injectAgentaryStyles(cssContent: string): void {
  // Remove existing styles if any
  removeAgentaryStyles();
  
  // Create and inject new styles
  const style = document.createElement('style');
  style.id = AGENTARY_STYLE_ID;
  style.textContent = cssContent;
  
  // Add viewport meta tag if not present for mobile compatibility
  ensureViewportMetaTag();
  
  // Set up mobile viewport height handling
  setupMobileViewportHandling();
  
  // Inject CSS variables
  injectCSSVariables();
  
  document.head.appendChild(style);
}

/**
 * Remove injected styles
 */
export function removeAgentaryStyles(): void {
  const existingStyle = document.getElementById(AGENTARY_STYLE_ID);
  if (existingStyle) {
    existingStyle.remove();
  }
  
  // Clean up mobile viewport handling
  cleanupMobileViewportHandling();
  
  // Remove CSS variables
  removeCSSVariables();
}

/**
 * Inject CSS variables into the document root
 */
function injectCSSVariables(): void {
  const root = document.documentElement;
  Object.entries(cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

/**
 * Remove CSS variables from the document root
 */
function removeCSSVariables(): void {
  const root = document.documentElement;
  Object.keys(cssVariables).forEach((property) => {
    root.style.removeProperty(property);
  });
}

/**
 * Ensure viewport meta tag is present for mobile compatibility
 */
function ensureViewportMetaTag(): void {
  const existingViewport = document.querySelector('meta[name="viewport"]');
  
  if (!existingViewport) {
    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, viewport-fit=cover';
    document.head.appendChild(viewport);
  } else {
    // Enhance existing viewport meta tag with viewport-fit=cover for safe areas
    const content = existingViewport.getAttribute('content') || '';
    if (!content.includes('viewport-fit')) {
      existingViewport.setAttribute('content', content + ', viewport-fit=cover');
    }
  }
}

/**
 * Set up mobile viewport height handling for Safari
 */
function setupMobileViewportHandling(): void {
  // Only set up on mobile devices
  if (!isMobileDevice()) return;
  
  // Create CSS custom property for actual viewport height
  const updateViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--agentary-vh', `${vh}px`);
  };
  
  // Update on load and resize
  updateViewportHeight();
  window.addEventListener('resize', updateViewportHeight);
  window.addEventListener('orientationchange', () => {
    // Delay to account for orientation change
    setTimeout(updateViewportHeight, 100);
  });
  
  // Store the cleanup function
  (window as any).__agentaryViewportCleanup = () => {
    window.removeEventListener('resize', updateViewportHeight);
    window.removeEventListener('orientationchange', updateViewportHeight);
    document.documentElement.style.removeProperty('--agentary-vh');
  };
}

/**
 * Clean up mobile viewport handling
 */
function cleanupMobileViewportHandling(): void {
  const cleanup = (window as any).__agentaryViewportCleanup;
  if (cleanup) {
    cleanup();
    delete (window as any).__agentaryViewportCleanup;
  }
}

/**
 * Detect if device is mobile
 */
function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
} 