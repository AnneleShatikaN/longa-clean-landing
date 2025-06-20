
export const useGlobalDataMode = () => {
  // Application now only supports live mode
  return {
    dataMode: 'live' as const,
    isDevelopmentMode: import.meta.env.DEV || false
  };
};
