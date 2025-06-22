import { useEffect, useRef, useState } from 'react';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import api from '../services/api';

/**
 * Hook to synchronize API service with Zustand store
 * This replaces the synchronization that was previously done in AppContext
 */
export const useApiSync = () => {
  const apiKey = useAppConfigStore(state => state.apiKey);
  const apiStage = useAppConfigStore(state => state.apiStage);
  
  // Use refs to track previous values and prevent unnecessary updates
  const prevApiKeyRef = useRef<string | null>(null);
  const prevApiStageRef = useRef<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Delay initial sync to prevent unmount/remount during initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialized(true);
      console.log('🚀 useApiSync: Initialization delay complete, ready to sync');
    }, 150); // Delay slightly longer than ThemeContextProvider

    return () => clearTimeout(timer);
  }, []);

  // Sync API key with Zustand store only when it actually changes and after initialization
  useEffect(() => {
    if (!isInitialized) return;
    
    if (apiKey && apiKey !== prevApiKeyRef.current) {
      console.log('🔑 useApiSync: API key changed, updating...');
      api.setApiKey(apiKey);
      prevApiKeyRef.current = apiKey;
    }
  }, [apiKey, isInitialized]);

  // Sync API environment with Zustand store only when it actually changes and after initialization
  useEffect(() => {
    if (!isInitialized) return;
    
    if (apiStage && apiStage !== prevApiStageRef.current) {
      console.log('🌍 useApiSync: API stage changed, updating...', apiStage);
      api.setEnvironment(apiStage);
      prevApiStageRef.current = apiStage;
    }
  }, [apiStage, isInitialized]);

  return null;
};
