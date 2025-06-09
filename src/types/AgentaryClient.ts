import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import type { DeviceType, BrowserType } from '../utils/Environment';

export interface AgentaryClientConfig {
  apiKey?: string;
  baseUrl?: string;
  debug?: boolean;
  loadModel?: boolean;
  contentSelector?: string;
  showWidgetOnInit?: boolean;
  generatePagePrompts?: boolean;
  maxPagePrompts?: number;
  // Environment configuration
  environment?: {
    allowedDevices?: DeviceType[];
    allowedBrowsers?: BrowserType[];
    disallowedDevices?: DeviceType[];
    disallowedBrowsers?: BrowserType[];
  };
  // Analytics configuration
  analytics?: {
    mixpanelToken?: string;
    enabled?: boolean;
    userId?: string;
    debug?: boolean;
  };
}

export interface SummarizeContentOptions {
  content?: string;
  contentSelector?: string;
  maxContentChars?: number;
  streamResponse?: boolean;
  onStreamToken?: (token: string) => void;
}

export interface GeneratePromptsOptions {
  content?: string;
  contentSelector?: string;
  maxContentChars?: number;
  promptCount?: number;
}

export interface ExplainTextOptions {
  content?: string;
  contentSelector?: string;
  maxContentChars?: number;
  text?: string;
  selectedText?: boolean;
  streamResponse?: boolean;
  onStreamToken?: (token: string) => void;
}

export interface PostMessageOptions {
  previousMessages?: ChatCompletionMessageParam[];
  content?: string;
  contentSelector?: string;
  maxContentChars?: number;
  streamResponse?: boolean;
  onStreamToken?: (token: string) => void;
}
