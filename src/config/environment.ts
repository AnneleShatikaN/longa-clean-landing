
export interface AppConfig {
  environment: 'development' | 'staging' | 'production';
  apiBaseUrl: string;
  enableLogging: boolean;
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  maintenanceMode: boolean;
  version: string;
  buildTimestamp: string;
}

export const getEnvironment = (): AppConfig['environment'] => {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'development';
    }
    if (hostname.includes('staging') || hostname.includes('test')) {
      return 'staging';
    }
  }
  return import.meta.env.MODE === 'development' ? 'development' : 'production';
};

export const config: AppConfig = {
  environment: getEnvironment(),
  apiBaseUrl: getEnvironment() === 'development' 
    ? 'http://localhost:3001/api' 
    : 'https://api.yourapp.com',
  enableLogging: getEnvironment() !== 'production',
  enableAnalytics: getEnvironment() === 'production',
  enableErrorTracking: getEnvironment() === 'production',
  maintenanceMode: false, // Can be toggled via admin panel
  version: '1.0.0',
  buildTimestamp: new Date().toISOString(),
};

// Third-party service configuration
export const serviceConfig = {
  analytics: {
    googleAnalyticsId: getEnvironment() === 'production' ? 'GA_PROD_ID' : 'GA_DEV_ID',
    mixpanelToken: getEnvironment() === 'production' ? 'MIXPANEL_PROD' : 'MIXPANEL_DEV',
  },
  monitoring: {
    sentryDsn: getEnvironment() === 'production' ? 'SENTRY_PROD_DSN' : null,
    logRocketId: getEnvironment() === 'production' ? 'LOGROCKET_PROD' : null,
  },
  cdn: {
    assetsUrl: getEnvironment() === 'production' 
      ? 'https://cdn.yourapp.com' 
      : '/assets',
    imagesUrl: getEnvironment() === 'production'
      ? 'https://images.yourapp.com'
      : '/images',
  },
};

console.log('🚀 App Config:', { 
  environment: config.environment,
  version: config.version,
  maintenanceMode: config.maintenanceMode 
});
