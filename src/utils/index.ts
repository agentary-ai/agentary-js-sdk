/**
 * Utility module exports
 */
export { EventEmitter } from './EventEmitter';
export { Logger } from './Logger';
export { Analytics, getAnalytics, setAnalytics } from './Analytics';
export { extractPageContent } from './content-extraction';
export { getSelectedText } from './selected-text';
export { 
  detectDeviceType, 
  detectBrowserType, 
  isEnvironmentAllowed, 
  getCurrentEnvironment,
  type DeviceType,
  type BrowserType 
} from './Environment';
export { cleanUrl, isValidUrl } from './UrlUtils';