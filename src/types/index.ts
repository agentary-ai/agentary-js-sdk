/**
 * Core type definitions for Agentary SDK
 */

export interface AgentaryConfig {
  apiKey?: string;
  baseUrl?: string;
  debug?: boolean;
  loadModel?: boolean;
  workerUrl?: string;
  contentSelector?: string;
  showWidget?: boolean;
  generateQuestions?: boolean;
  maxQuestions?: number;
}

export interface WebLLMConfig {
  modelPath: string;
  useWorker?: boolean;
  workerUrl?: string;
}

export interface ProgressCallback {
  (progress: number): void;
}

export interface ContentExtractionOptions {
  contentSelector?: string;
  maxLength?: number;
  includeMetadata?: boolean;
}

export interface SummarizeOptions extends ContentExtractionOptions {
  maxSummaryLength?: number;
  style?: 'brief' | 'detailed' | 'bullet-points';
}

export interface ExplainOptions extends ContentExtractionOptions {
  context?: string;
  level?: 'simple' | 'detailed' | 'technical';
}

export interface WidgetOptions {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  autoOpenOnLoad?: boolean;
  generateQuestions?: boolean;
  maxQuestions?: number;
  contentSelector?: string;
}

export interface RSSFeed {
  url: string;
  title?: string;
  type?: string;
  score?: number;
}

export interface PageContent {
  title?: string;
  content: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

export interface LogLevel {
  DEBUG: 0;
  INFO: 1;
  WARN: 2;
  ERROR: 3;
}

export interface EventListener {
  (...args: any[]): void;
}

export interface EventMap {
  [event: string]: EventListener[];
} 