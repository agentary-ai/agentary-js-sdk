import { render } from 'preact';
import { h } from 'preact';
import { WebLLMClient } from '../core/WebLLMClient';
import { getAnalytics } from '../utils/Analytics';
import type { WidgetOptions } from '../types/index';
import { Logger } from '../utils/Logger';
import { Popup } from './Popup';
import { removeAgentaryStyles } from './styles';

// Global widget state to track mounted widgets
let mountedWidgets: Map<string, {
  container: HTMLElement;
  cleanup: () => void;
}> = new Map();

/** 
 * Injects Font Awesome CSS into the page
 */
function injectFontAwesome() {
  // Check if Font Awesome is already loaded
  if (document.querySelector('link[href*="fontawesome"]') || 
      document.querySelector('style[data-fontawesome]')) {
    return;
  }

  // Create and inject Font Awesome CSS link
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
  link.integrity = 'sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==';
  link.crossOrigin = 'anonymous';
  link.referrerPolicy = 'no-referrer';
  document.head.appendChild(link);
}

/**
 * Generates a unique widget ID
 */
function generateWidgetId(): string {
  return `agentary-widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Mounts the Preact UI widget
 * @param webLLMClient - The Agentary client instance
 * @param widgetOptions - UI configuration options
 * @param logger - The logger instance
 * @returns Object with unmount function and widget ID
 */
export function mountWidget(
  webLLMClient: WebLLMClient, 
  widgetOptions: WidgetOptions = {},
  logger: Logger
): { unmount: () => void; widgetId: string } {
  const widgetId = generateWidgetId();
  const analytics = getAnalytics();

  // Track widget mounting
  analytics?.track('widget_mounted', {
    auto_open: widgetOptions.autoOpenOnLoad || false,
    generate_page_prompts: widgetOptions.generatePagePrompts || false,
    page_url: window.location.href,
    page_domain: window.location.hostname,
  });

  // Inject Font Awesome CSS
  injectFontAwesome();

  // Create container for the Preact app
  const container = document.createElement('div');
  container.id = widgetId;
  container.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 9999;
  `;
  
  // Make child elements have pointer events
  container.style.setProperty('--child-pointer-events', 'auto');
  
  document.body.appendChild(container);

  // Render the Popup Preact widget
  render(
    h(Popup, {
      webLLMClient,
      widgetOptions,
      onClose: () => {
        // Optional: handle popup close events here
        logger.info(`Popup closed for widget ${widgetId}`);
      }
    }),
    container
  );

  // Create cleanup function
  const cleanup = () => {
    // Unmount Preact component
    render(null, container);
    
    // Remove container
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    
    // Track widget unmounting
    analytics?.track('widget_unmounted', {
      widget_id: widgetId,
      page_url: window.location.href,
      page_domain: window.location.hostname,
    });

    logger.info(`Widget ${widgetId} unmounted`);
  };

  // Store widget reference
  mountedWidgets.set(widgetId, {
    container,
    cleanup
  });

  // Create unmount function
  const unmount = () => {
    cleanup();
    mountedWidgets.delete(widgetId);
  };

  logger.info(`Widget ${widgetId} mounted with Preact`);

  return { unmount, widgetId };
}

/**
 * Unmounts a specific widget by ID
 * @param widgetId - The ID of the widget to unmount
 * @returns boolean indicating success
 */
export function unmountWidget(widgetId: string): boolean {
  const widget = mountedWidgets.get(widgetId);
  if (widget) {
    widget.cleanup();
    mountedWidgets.delete(widgetId);
    return true;
  }
  return false;
}

/**
 * Unmounts all mounted widgets
 * @returns number of widgets unmounted
 */
export function unmountAllWidgets(): number {
  const count = mountedWidgets.size;
  mountedWidgets.forEach((widget) => {
    widget.cleanup();
  });
  mountedWidgets.clear();
  
  // Clean up styles if no widgets remain
  if (count > 0) {
    removeAgentaryStyles();
  }
  
  return count;
}

/**
 * Gets information about all mounted widgets
 * @returns Array of widget information
 */
export function getMountedWidgets(): Array<{ widgetId: string; hasButton: boolean; hasDialog: boolean }> {
  return Array.from(mountedWidgets.entries()).map(([widgetId, widget]) => ({
    widgetId,
    hasButton: !!widget.container.parentNode, // Container represents the widget presence
    hasDialog: !!widget.container.parentNode
  }));
} 