import { Logger } from '../../utils/Logger';
import { WebLLMClient } from '../llm/WebLLMClient';
import { mountWidget, unmountWidget, unmountAllWidgets, getMountedWidgets } from '../../ui';
import { WidgetOptions } from '../../types/index';
import type { AgentaryClientConfig } from '../../types/AgentaryClient';
import type { RelatedArticlesService } from './RelatedArticlesService';

/**
 * Service for handling widget operations
 */
export class WidgetService {
  private logger: Logger;
  private config: AgentaryClientConfig;
  private relatedArticlesService?: RelatedArticlesService;

  constructor(config: AgentaryClientConfig, logger: Logger, relatedArticlesService?: RelatedArticlesService) {
    this.config = config;
    this.logger = logger;
    if (relatedArticlesService) {
      this.relatedArticlesService = relatedArticlesService;
    }
  }

  /**
   * Mount a new widget with the specified options
   */
  mountWidget(llmClient: WebLLMClient, options: WidgetOptions = {}): { unmount: () => void; widgetId: string } {
    const widgetOptions: WidgetOptions = {
      position: "bottom-right",
      autoOpenOnLoad: false,
      generatePagePrompts: this.config.generatePagePrompts || false,
      maxPagePrompts: this.config.maxPagePrompts || 5,
      ...options
    };
    
    // Add contentSelector from config if not provided in options
    if (this.config.contentSelector && !widgetOptions.contentSelector) {
      widgetOptions.contentSelector = this.config.contentSelector;
    }

    this.logger.debug('Fetching related articles for widget');
    
    // Fetch related articles when mounting the widget
    // if (this.relatedArticlesService) {
    //   const relatedArticlesOptions: any = {};
    //   if (widgetOptions.contentSelector) {
    //     relatedArticlesOptions.contentSelector = widgetOptions.contentSelector;
    //   }
      
    //   this.relatedArticlesService.getRelatedArticles(relatedArticlesOptions).then(relatedArticles => {
    //     this.logger.debug('Related articles fetched for widget:', relatedArticles);
    //     // Related articles will be passed to the UI via the updated mountWidget function
    //   }).catch(error => {
    //     this.logger.error('Failed to fetch related articles for widget:', error);
    //   });
    // }

    this.logger.debug('Mounting widget with options:', widgetOptions);
    
    return mountWidget(llmClient, widgetOptions, this.logger, this.relatedArticlesService);
  }

  /**
   * Unmount a specific widget by ID
   */
  unmountWidget(widgetId: string): boolean {
    this.logger.info(`Unmounting widget: ${widgetId}`);
    return unmountWidget(widgetId);
  }

  /**
   * Unmount all mounted widgets
   */
  unmountAllWidgets(): number {
    this.logger.info('Unmounting all widgets');
    return unmountAllWidgets();
  }

  /**
   * Get information about all mounted widgets
   */
  getMountedWidgets(): Array<{ widgetId: string; hasButton: boolean; hasDialog: boolean }> {
    return getMountedWidgets();
  }
} 