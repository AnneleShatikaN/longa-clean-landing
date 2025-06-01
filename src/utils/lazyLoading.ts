
import { lazy, ComponentType } from 'react';

// Generic type for React components
type ComponentProps = Record<string, any>;

export const lazyLoad = <T extends ComponentProps = {}>(
  factory: () => Promise<{ default: ComponentType<T> }>
) => {
  return lazy(factory);
};

// Enhanced lazy loading with retry mechanism
export const lazyLoadWithRetry = <T extends ComponentProps = {}>(
  factory: () => Promise<{ default: ComponentType<T> }>,
  maxRetries = 3
) => {
  return lazy(() => {
    return new Promise<{ default: ComponentType<T> }>((resolve, reject) => {
      let retries = 0;
      
      const attemptLoad = () => {
        factory()
          .then(resolve)
          .catch((error) => {
            if (retries < maxRetries) {
              retries++;
              setTimeout(attemptLoad, 1000 * retries);
            } else {
              reject(error);
            }
          });
      };
      
      attemptLoad();
    });
  });
};
