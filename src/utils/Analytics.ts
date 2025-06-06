import { Logger } from './Logger';
import mixpanel from 'mixpanel-browser';
import { Mixpanel } from 'mixpanel-browser';

/**
 * Analytics event types for type safety
 */
export interface AnalyticsEvents {
  'widget_mounted': {
    auto_open: boolean;
    generate_page_prompts: boolean;
    page_url: string;
    page_domain: string;
  };
  'widget_button_clicked': {
    action: 'open' | 'close';
    page_url: string;
    page_domain: string;
    model_loaded: boolean;
  };
  'model_loading_started': {
    model_name: string;
    page_url: string;
    page_domain: string;
  };
  'model_loading_completed': {
    model_name: string;
    loading_time_ms: number;
    page_url: string;
    page_domain: string;
  };
  'model_loading_failed': {
    model_name: string;
    error: string;
    page_url: string;
    page_domain: string;
  };
  'chat_dialog_opened': {
    trigger: 'manual' | 'auto_open';
    model_loaded: boolean;
    page_url: string;
    page_domain: string;
  };
  'chat_dialog_closed': {
    session_length_ms: number;
    messages_sent: number;
    page_url: string;
    page_domain: string;
  };
  'message_sent': {
    message_length: number;
    conversation_turn: number;
    feature_used: 'chat' | 'explain' | 'summarize' | 'prompts';
    has_context: boolean;
    page_url: string;
    page_domain: string;
  };
  'ai_response_received': {
    response_time_ms: number;
    response_length: number;
    feature_used: 'chat' | 'explain' | 'summarize' | 'prompts';
    streaming: boolean;
    page_url: string;
    page_domain: string;
  };
  'feature_used': {
    feature: 'explain' | 'summarize' | 'prompts';
    has_selection: boolean;
    content_length?: number;
    page_url: string;
    page_domain: string;
  };
  'context_menu_opened': {
    selected_text_length: number;
    page_url: string;
    page_domain: string;
  };
  'context_menu_action': {
    action: 'explain' | 'summarize';
    selected_text_length: number;
    page_url: string;
    page_domain: string;
  };
  'error_occurred': {
    error_type: string;
    error_message: string;
    feature: string;
    page_url: string;
    page_domain: string;
  };
  'page_prompts_generated': {
    prompt_count: number;
    content_length: number;
    generation_time_ms: number;
    page_url: string;
    page_domain: string;
  };
  'page_time_spent': {
    page_url: string;
    page_title: string;
    referrer?: string;
    page_domain: string;
  };
  'widget_session_time': {
    session_id: string;
    page_url: string;
    page_domain: string;
  };
  'feature_usage_time': {
    feature: 'chat' | 'explain' | 'summarize' | 'prompts';
    page_url: string;
    page_domain: string;
  };
}

/**
 * Configuration for Analytics
 */
export interface AnalyticsConfig {
  enabled?: boolean;
  debug?: boolean;
}

/**
 * Analytics service for tracking user interactions with Agentary
 */
export class Analytics {
  private mixpanel: Mixpanel | null = null;
  private projectToken: string = '7fee90ee92588fadee390be1eaae54cc';
  private config: AnalyticsConfig;
  private logger: Logger;
  private sessionStart: number = Date.now();
  private isInitialized: boolean = false;
  private eventQueue: Array<{ event: string; properties: any }> = [];
  private pageStartTime: number = Date.now();
  private activeTimers: Set<string> = new Set();


  constructor(config: AnalyticsConfig, logger: Logger) {
    this.config = config
    this.logger = logger;
    
    if (this.config.enabled) {
      this.initializeMixpanel();
    }
  }

  /**
   * Initialize Mixpanel
   */
  private async initializeMixpanel(): Promise<void> {
    try {
      this.mixpanel = mixpanel.init(this.projectToken, {
        debug: this.config.debug || false,
        track_pageview: true,
        persistence: 'localStorage',
        autocapture: {
            click: false,
            input: false,
            pageview: 'url-with-path',
            scroll: true,
            submit: false,
        }
      }, 'Agentary');

      this.isInitialized = true;

      // Process queued events
      this.processEventQueue();

      this.logger.debug('Analytics initialized with Mixpanel');

    } catch (error) {
      this.logger.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Process queued events after initialization
   */
  private processEventQueue(): void {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        if (event.event === '__START_TIMING__') {
          // Process queued timing starts
          this.startTiming(event.properties.eventName);
        } else {
          this.trackEvent(event.event, event.properties);
        }
      }
    }
  }

  /**
   * Track an event with type safety
   */
  track<K extends keyof AnalyticsEvents>(
    event: K,
    properties: AnalyticsEvents[K]
  ): void {
    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      session_id: this.sessionStart,
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    };

    if (this.config.enabled) {
      if (this.isInitialized && this.mixpanel) {
        this.trackEvent(event, enrichedProperties);
        // Remove from active timers if it was being timed
        if (this.activeTimers.has(event)) {
          this.activeTimers.delete(event);
        }
      } else {
        // Queue event if not initialized yet
        this.eventQueue.push({ event, properties: enrichedProperties });
      }
    }

    if (this.config.debug) {
      this.logger.debug(`Analytics event: ${event}`, enrichedProperties);
    }
  }

  /**
   * Internal method to track event
   */
  private trackEvent(event: string, properties: any): void {
    try {
      if (this.mixpanel) {
        this.mixpanel.track(event, properties);
      }
    } catch (error) {
      this.logger.error('Failed to track event:', error);
    }
  }

  /**
   * Increment user properties
   */
  incrementUser(properties: Record<string, number>): void {
    if (!this.config.enabled) return;

    try {
      if (this.mixpanel) {
        this.mixpanel.people.increment(properties);
      }
    } catch (error) {
      this.logger.error('Failed to increment user properties:', error);
    }
  }

  /**
   * Start timing an event using Mixpanel's time_event functionality
   */
  startTiming(eventName: string): void {
    if (!this.config.enabled) return;

    try {
      if (this.isInitialized && this.mixpanel) {
        this.mixpanel.time_event(eventName);
        this.activeTimers.add(eventName);
        
        if (this.config.debug) {
          this.logger.debug(`Started timing event: ${eventName}`);
        }
      } else {
        // Queue the timing start if not initialized yet
        this.eventQueue.push({ event: '__START_TIMING__', properties: { eventName } });
      }
    } catch (error) {
      this.logger.error('Failed to start timing event:', error);
    }
  }

  /**
   * Start tracking time spent on current page
   */
  startPageTimeTracking(): void {
    this.pageStartTime = Date.now();
    this.startTiming('page_time_spent');
    
    if (this.config.debug) {
      this.logger.debug('Started tracking page time for:', window.location.href);
    }
  }

  /**
   * Track time spent on page when user leaves or session ends
   */
  trackPageTimeSpent(): void {
    if (!this.config.enabled) return;

    const properties: AnalyticsEvents['page_time_spent'] = {
      page_url: window.location.href,
      page_title: document.title,
      page_domain: window.location.hostname,
    };

    // Only include referrer if it exists and is not empty
    if (document.referrer && document.referrer.length > 0) {
      properties.referrer = document.referrer;
    }

    this.track('page_time_spent', properties);

    if (this.config.debug) {
      this.logger.debug('Tracked page time spent for:', window.location.href);
    }
  }

  /**
   * Start timing a specific feature usage
   */
  startFeatureUsageTiming(feature: 'chat' | 'explain' | 'summarize' | 'prompts'): void {
    const eventName = 'feature_usage_time';
    this.startTiming(eventName);
    
    // Store feature type for when we track the event
    if (!this.isInitialized || !this.mixpanel) {
      this.eventQueue.push({ 
        event: '__FEATURE_TIMING__', 
        properties: { feature, eventName }
      });
    }
  }

  /**
   * Track feature usage time
   */
  trackFeatureUsageTime(feature: 'chat' | 'explain' | 'summarize' | 'prompts'): void {
    this.track('feature_usage_time', {
      feature,
      page_url: window.location.href,
      page_domain: window.location.hostname,
    });
  }

  /**
   * Start timing widget session
   */
  startWidgetSessionTiming(): void {
    const sessionId = `session_${this.sessionStart}`;
    this.startTiming('widget_session_time');
    
    if (this.config.debug) {
      this.logger.debug('Started timing widget session:', sessionId);
    }
  }

  /**
   * Track widget session time
   */
  trackWidgetSessionTime(): void {
    const sessionId = `session_${this.sessionStart}`;
    this.track('widget_session_time', {
      session_id: sessionId,
      page_url: window.location.href,
      page_domain: window.location.hostname,
    });
  }

  /**
   * Track timing events (legacy method for backward compatibility)
   */
  timeEvent(eventName: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      return duration;
    };
  }

  /**
   * Flush any pending events (useful for page unload)
   */
  flush(): void {
    if (this.mixpanel) {
      try {
        // Track page time spent before session ends
        this.trackPageTimeSpent();
        
        // Track session end
        this.mixpanel.track('session_ended', {
          session_duration_ms: Date.now() - this.sessionStart,
          page_url: window.location.href,
          page_domain: window.location.hostname,
        });
      } catch (error) {
        this.logger.error('Failed to flush analytics:', error);
      }
    }
  }

  /**
   * Setup automatic page time tracking with visibility API
   */
  setupPageTimeTracking(): void {
    if (!this.config.enabled) return;

    // Start tracking when page loads
    this.startPageTimeTracking();

    // Track when page becomes hidden (user switches tabs, minimizes browser, etc.)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is now hidden, track the time spent
        this.trackPageTimeSpent();
      } else {
        // Page is visible again, restart timing
        this.startPageTimeTracking();
      }
    });

    // Track when user is about to leave the page
    window.addEventListener('beforeunload', () => {
      this.trackPageTimeSpent();
    });

    // Track when page loses focus
    window.addEventListener('blur', () => {
      this.trackPageTimeSpent();
    });

    // Restart timing when page gains focus
    window.addEventListener('focus', () => {
      this.startPageTimeTracking();
    });

    if (this.config.debug) {
      this.logger.debug('Page time tracking setup completed');
    }
  }
}

/**
 * Global analytics instance (will be set by AgentaryClient)
 */
export let analytics: Analytics | null = null;

/**
 * Set the global analytics instance
 */
export function setAnalytics(instance: Analytics): void {
  analytics = instance;
}

/**
 * Get the global analytics instance
 */
export function getAnalytics(): Analytics | null {
  return analytics;
}