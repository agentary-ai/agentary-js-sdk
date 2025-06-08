import { AgentaryClient } from './core/index';
import type { AgentaryClientConfig } from './types/AgentaryClient';

export const init = (config?: AgentaryClientConfig): AgentaryClient => {
  return new AgentaryClient(config);
};

// Export widget functions for independent use
export { 
  mountWidget, 
  unmountWidget, 
  unmountAllWidgets, 
  getMountedWidgets 
} from './ui/widget';

// Export browser detection utilities
export {
  isSafari,
  isChrome,
  isFirefox,
  isEdge,
  getBrowserName,
  supportsWebWorkers,
  hasWebWorkerIssues
} from './utils/BrowserDetection';

// Export types
export type { WidgetOptions } from './types/index';
export type { AgentaryClientConfig } from './types/AgentaryClient';