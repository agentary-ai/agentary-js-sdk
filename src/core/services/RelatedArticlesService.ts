import { Logger } from '../../utils/Logger';
import { ApiClient } from '../api/ApiClient';
import { cleanUrl } from '../../utils/UrlUtils';
import type { 
  AgentaryClientConfig,
  GetRelatedArticlesOptions,
  RelatedArticlesResponse,
  SimilarPage,
  RelatedArticlesStatistics,
} from '../../types/AgentaryClient';

/**
 * Service for handling related articles functionality
 */
export class RelatedArticlesService {
  private logger: Logger;
  private config: AgentaryClientConfig;
  private apiClient: ApiClient;

  constructor(config: AgentaryClientConfig, apiClient: ApiClient, logger: Logger) {
    this.config = config;
    this.apiClient = apiClient;
    this.logger = logger;
  }

  /**
   * Get related articles for the current page from the backend
   */
  async getRelatedArticles(options: GetRelatedArticlesOptions = {}): Promise<RelatedArticlesResponse> {
    try {
      // Get current page information
      // const rawUrl = options.url || (typeof window !== 'undefined' ? window.location.href : '');
      const rawUrl = "https://variety.com/2025/film/box-office/f1-movie-megan-sequel-box-office-opening-weekend-projections-1236439291/"
      
      // Clean the URL before sending to API
      const url = cleanUrl(rawUrl);
      
      // Get page content if not provided
      // let content = options.content;
      // if (!content && typeof document !== 'undefined') {
      //   const selector = options.contentSelector || this.config.contentSelector || 'body';
      //   const element = document.querySelector(selector);
      //   if (element) {
      //     content = element.textContent || (element as HTMLElement).innerText || '';
          
      //     // Limit content length if content exists
      //     if (content) {
      //       const maxChars = options.maxContentChars || 8000;
      //       if (content.length > maxChars) {
      //         content = content.substring(0, maxChars) + '...';
      //       }
      //     }
      //   }
      // }

      // Call the backend API
      const response = await this.apiClient.post('/v1/page/similar', {
        url
        // content
      });

      this.logger.debug('Related articles response:', response);
      return response;
    } catch (error) {
      this.logger.error('Failed to get related articles:', error);
      throw error;
    }
  }

  /**
   * Get just the similar pages from related articles (convenience method)
   */
  async getSimilarPages(options: GetRelatedArticlesOptions = {}): Promise<SimilarPage[]> {
    const response = await this.getRelatedArticles(options);
    return response.data.similar_pages;
  }

  /**
   * Get related articles statistics (convenience method)
   */
  async getRelatedArticlesStats(options: GetRelatedArticlesOptions = {}): Promise<RelatedArticlesStatistics> {
    const response = await this.getRelatedArticles(options);
    return response.data.statistics;
  }
} 