import { AgentaryClient, ApiClient, WidgetService, ContentService, RelatedArticlesService } from './core/index';
import type { AgentaryClientConfig } from './types/AgentaryClient';

export const init = (config?: AgentaryClientConfig): AgentaryClient => {
  return new AgentaryClient(config);
};

// Export core components for direct use
export { 
  ApiClient, 
  WidgetService, 
  ContentService, 
  RelatedArticlesService 
};

// // Export widget functions for independent use
// export { 
//   mountWidget, 
//   unmountWidget, 
//   unmountAllWidgets, 
//   getMountedWidgets 
// } from './ui/index';

// // Export browser detection utilities
// export {
//   isSafari,
//   isChrome,
//   isFirefox,
//   isEdge,
//   getBrowserName,
//   supportsWebWorkers,
//   hasWebWorkerIssues
// } from './utils/BrowserDetection';

// // Export environment detection utilities
// export {
//   detectDeviceType,
//   detectBrowserType,
//   isEnvironmentAllowed,
//   getCurrentEnvironment,
//   type DeviceType,
//   type BrowserType
// } from './utils/Environment';

// Export types
export type { 
  AgentaryClientConfig,
  GetRelatedArticlesOptions,
  RelatedArticlesResponse,
  SimilarPage,
  ContentMetadata,
  RelatedArticlesStatistics
} from './types/AgentaryClient';
// export type { WidgetOptions } from './types/index';