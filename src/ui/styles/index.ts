/**
 * Main styles index - combines all component styles
 */
import { animations } from './animations';
import { buttonStyles } from './components/button';
import { popupStyles } from './components/popup';
import { headerStyles } from './components/header';
import { contentStyles } from './components/content';
import { inputStyles } from './components/input';
import { chatStyles } from './components/chat';
import { articlesStyles } from './components/articles';
import { skeletonStyles } from './components/skeleton';
import { footerStyles } from './components/footer';
import { responsiveStyles } from './responsive';
import { injectAgentaryStyles as injectStyles, removeAgentaryStyles } from './utils';

// Combine all CSS styles
export const cssStyles = `
  ${animations}
  ${buttonStyles}
  ${popupStyles}
  ${headerStyles}
  ${contentStyles}
  ${inputStyles}
  ${chatStyles}
  ${articlesStyles}
  ${skeletonStyles}
  ${footerStyles}
  ${responsiveStyles}
`;

// Wrapper function that injects the combined styles
export function injectAgentaryStyles(): void {
  injectStyles(cssStyles);
}

// Re-export utilities and constants
export { removeAgentaryStyles } from './utils';
export { cssVariables } from './variables';
export { classNames } from './classNames'; 