
import { useEffect, useCallback } from 'react';
import { config } from '@/config/environment';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface ErrorReport {
  message: string;
  stack?: string;
  component?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  userId?: string;
}

interface UserEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private errors: ErrorReport[] = [];
  private events: UserEvent[] = [];

  trackMetric(name: string, value: number, metadata?: Record<string, any>) {
    if (!config.enableAnalytics) return;

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    console.log('📊 Performance Metric:', metric);

    // In production, send to analytics service
    if (config.environment === 'production') {
      this.sendToAnalytics('metric', metric);
    }
  }

  trackError(error: Error, component?: string) {
    if (!config.enableErrorTracking) return;

    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      component,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    this.errors.push(errorReport);
    console.error('🚨 Error Tracked:', errorReport);

    // In production, send to error tracking service
    if (config.environment === 'production') {
      this.sendToErrorTracking(errorReport);
    }
  }

  trackEvent(event: string, properties: Record<string, any> = {}) {
    if (!config.enableAnalytics) return;

    const userEvent: UserEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    this.events.push(userEvent);
    console.log('📈 Event Tracked:', userEvent);

    // In production, send to analytics service
    if (config.environment === 'production') {
      this.sendToAnalytics('event', userEvent);
    }
  }

  private async sendToAnalytics(type: string, data: any) {
    try {
      // Simulate analytics API call
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, data }),
      });
    } catch (error) {
      console.warn('Failed to send analytics:', error);
    }
  }

  private async sendToErrorTracking(error: ErrorReport) {
    try {
      // Simulate error tracking API call
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
    } catch (err) {
      console.warn('Failed to send error report:', err);
    }
  }

  getMetrics() {
    return this.metrics;
  }

  getErrors() {
    return this.errors;
  }

  getEvents() {
    return this.events;
  }

  clearData() {
    this.metrics = [];
    this.errors = [];
    this.events = [];
  }
}

const performanceMonitor = new PerformanceMonitor();

export const usePerformanceMonitoring = () => {
  const trackPageLoad = useCallback(() => {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      performanceMonitor.trackMetric('page_load_time', navigation.loadEventEnd - navigation.loadEventStart);
      performanceMonitor.trackMetric('dom_content_loaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
      performanceMonitor.trackMetric('first_paint', navigation.responseStart - navigation.requestStart);
    }
  }, []);

  const trackUserAction = useCallback((action: string, properties?: Record<string, any>) => {
    performanceMonitor.trackEvent(`user_${action}`, properties);
  }, []);

  const trackComponentRender = useCallback((componentName: string, renderTime: number) => {
    performanceMonitor.trackMetric('component_render_time', renderTime, { component: componentName });
  }, []);

  const trackError = useCallback((error: Error, component?: string) => {
    performanceMonitor.trackError(error, component);
  }, []);

  const trackAPICall = useCallback((endpoint: string, duration: number, status: number) => {
    performanceMonitor.trackMetric('api_call_duration', duration, { endpoint, status });
  }, []);

  useEffect(() => {
    // Track page load performance
    if (document.readyState === 'complete') {
      trackPageLoad();
    } else {
      window.addEventListener('load', trackPageLoad);
      return () => window.removeEventListener('load', trackPageLoad);
    }
  }, [trackPageLoad]);

  return {
    trackUserAction,
    trackComponentRender,
    trackError,
    trackAPICall,
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getErrors: performanceMonitor.getErrors.bind(performanceMonitor),
    getEvents: performanceMonitor.getEvents.bind(performanceMonitor),
  };
};

export default performanceMonitor;
