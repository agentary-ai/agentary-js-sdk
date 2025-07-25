import { ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import type { DeviceType, BrowserType } from '../utils/Environment';
import type { BrowserLLMProvider } from '../core/llm/LLMClientInterface';

export interface AgentaryClientConfig {
  apiKey?: string;
  baseUrl?: string;
  debug?: boolean;
  loadModel?: boolean;
  contentSelector?: string;
  showWidgetOnInit?: boolean;
  autoOpenWidgetOnLoad?: boolean;
  generatePagePrompts?: boolean;
  maxPagePrompts?: number;
  
  // LLM Provider configuration
  provider?: BrowserLLMProvider;
  model?: string;
  proxyUrl?: string;
  proxyHeaders?: Record<string, string>;
  useWorker?: boolean;
  
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

export interface GetRelatedArticlesOptions {
  url?: string;
  title?: string;
  content?: string;
  contentSelector?: string;
  maxContentChars?: number;
}

export interface SimilarityScores {
  base_similarity: number;
  enhanced_similarity: number;
}

export interface ContentOverlaps {
  keywords: number;
  topics: number;
}

export interface ContentMetadata {
  summary: string;
  keywords: string[];
  topics: string[];
  title: string;
  author: string;
  published_date: string;
}

export interface SimilarPage {
  url: string;
  similarity_scores: SimilarityScores;
  overlaps: ContentOverlaps;
  content_parsed_id: string;
  domain: string;
  embedding_id: string;
  content_metadata: ContentMetadata;
  main_image_url: string;
  author: string | null;
  short_summary: string;
  site_name: string;
}

export interface RelatedArticlesStatistics {
  total_found: number;
  average_similarity: number;
  total_keyword_overlaps: number;
  total_topic_overlaps: number;
  similarity_threshold: number;
}

export interface RelatedArticlesData {
  source_url: string;
  similar_pages: SimilarPage[];
  statistics: RelatedArticlesStatistics;
}

export interface RelatedArticlesResponse {
  url: string;
  data: RelatedArticlesData;
}
