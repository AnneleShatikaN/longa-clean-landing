
import React, { lazy, Suspense, ComponentType } from 'react';

// Loading fallback component
export const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Utility for creating lazy-loaded components with error boundaries
export const createLazyComponent = <T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) => {
  const LazyComponent = lazy(factory);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Pre-built lazy components for common use cases
export const LazyDashboard = createLazyComponent(() => import('@/pages/AdminDashboard'));
export const LazyUserProfile = createLazyComponent(() => import('@/components/UserProfile'));

// Performance monitoring for lazy loading
export const trackLazyComponentLoad = (componentName: string) => {
  const startTime = performance.now();
  return () => {
    const endTime = performance.now();
    console.log(`🚀 ${componentName} loaded in ${endTime - startTime}ms`);
  };
};

// Bundle size optimization utilities
export const preloadComponent = (factory: () => Promise<any>) => {
  // Preload on idle or user interaction
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => factory());
  } else {
    setTimeout(() => factory(), 100);
  }
};

// Route-based code splitting helper
export const createRouteComponent = (importFn: () => Promise<any>) => {
  return createLazyComponent(importFn);
};
