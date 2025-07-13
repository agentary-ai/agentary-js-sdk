import { cssVariables } from './variables';

/**
 * Injects the Agentary styles into the document head
 */
export function injectAgentaryStyles(cssStyles: string): void {
  if (typeof document === 'undefined') return;
  
  // Check if styles are already injected
  if (document.getElementById('agentary-styles')) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'agentary-styles';
  
  // Add CSS variables to the document root
  const root = document.documentElement;
  Object.entries(cssVariables).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
  
  // Add CSS styles
  style.textContent = cssStyles;
  document.head.appendChild(style);
}

/**
 * Removes Agentary styles from the document
 */
export function removeAgentaryStyles(): void {
  if (typeof document === 'undefined') return;
  
  const style = document.getElementById('agentary-styles');
  if (style) {
    style.remove();
  }
  
  // Remove CSS variables from the document root
  const root = document.documentElement;
  Object.keys(cssVariables).forEach((property) => {
    root.style.removeProperty(property);
  });
} 