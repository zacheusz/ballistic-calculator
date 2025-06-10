import { useEffect } from 'react';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import api from '../services/api';

/**
 * Hook to synchronize API service with Zustand store
 * This replaces the synchronization that was previously done in AppContext
 */
export const useApiSync = () => {
  const apiKey = useAppConfigStore(state => state.apiKey);
  const apiStage = useAppConfigStore(state => state.apiStage);

  // Sync API key and environment with Zustand store
  useEffect(() => {
    if (apiKey) {
      api.setApiKey(apiKey);
    }
    
    if (apiStage) {
      api.setEnvironment(apiStage);
    }
  }, [apiKey, apiStage]);

  return null;
};
