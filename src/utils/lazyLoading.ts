
import { lazy, ComponentType } from 'react';
import { Loading } from '@/components/ui/loading';

interface LazyLoadOptions {
  fallback?: ComponentType;
  retries?: number;
  retryDelay?: number;
}

export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
) => {
  const { fallback = () => <Loading variant="spinner" size="lg" />, retries = 3, retryDelay = 1000 } = options;

  return lazy(() => {
    let retryCount = 0;
    
    const tryImport = (): Promise<{ default: T }> => {
      return importFunc().catch((error) => {
        console.warn(`Failed to load component (attempt ${retryCount + 1}):`, error);
        
        if (retryCount < retries) {
          retryCount++;
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(tryImport());
            }, retryDelay);
          });
        }
        
        throw error;
      });
    };

    return tryImport();
  });
};

// Lazy loaded page components
export const LazyClientDashboard = createLazyComponent(
  () => import('../pages/ClientDashboard'),
  { retries: 2 }
);

export const LazyProviderDashboard = createLazyComponent(
  () => import('../pages/ProviderDashboard'),
  { retries: 2 }
);

export const LazyAdminDashboard = createLazyComponent(
  () => import('../pages/AdminDashboard'),
  { retries: 2 }
);

export const LazyOneOffBooking = createLazyComponent(
  () => import('../pages/OneOffBooking'),
  { retries: 2 }
);

export const LazySubscriptionPackages = createLazyComponent(
  () => import('../pages/SubscriptionPackages'),
  { retries: 2 }
);

// Preload functions for better UX
export const preloadComponent = (importFunc: () => Promise<any>) => {
  const link = document.createElement('link');
  link.rel = 'modulepreload';
  link.href = importFunc.toString();
  document.head.appendChild(link);
};

export const preloadDashboards = () => {
  // Preload dashboard components when user is likely to navigate to them
  preloadComponent(() => import('../pages/ClientDashboard'));
  preloadComponent(() => import('../pages/ProviderDashboard'));
  preloadComponent(() => import('../pages/AdminDashboard'));
};

// Cache management
export class ComponentCache {
  private cache = new Map<string, any>();
  private maxSize = 50;

  set(key: string, component: any) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, component);
  }

  get(key: string) {
    return this.cache.get(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const componentCache = new ComponentCache();
