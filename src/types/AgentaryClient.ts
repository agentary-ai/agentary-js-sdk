export interface AgentaryClientConfig {
  apiKey?: string;
  baseUrl?: string;
  debug?: boolean;
  loadModel?: boolean;
  contentSelector?: string;
  showWidget?: boolean;
  generatePagePrompts?: boolean;
  maxPagePrompts?: number;
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

export interface ExplainSelectedTextOptions {
  contentSelector?: string;
  maxLength?: number;
  includeMetadata?: boolean;
}

export interface PostMessageOptions {
  contentSelector?: string;
  onToken?: (token: string) => void;
  previousMessages?: string[];
  includeMetadata?: boolean;
}
