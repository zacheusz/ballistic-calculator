import React, { createContext, useContext, useMemo } from 'react';
import useBallisticsStore from '../stores/useBallisticsStore';
import { BallisticsState } from '../types/ballistics';

type BallisticsStoreContextType = ReturnType<typeof useBallisticsStore>;

// Create context with a default value that will be properly typed
const BallisticsStoreContext = createContext<BallisticsStoreContextType | null>(null);

export const BallisticsStoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get the store instance
  const store = useBallisticsStore;
  
  // Memoize the store to prevent unnecessary re-renders
  const storeValue = useMemo(() => store, [store]);
  
  return (
    <BallisticsStoreContext.Provider value={storeValue}>
      {children}
    </BallisticsStoreContext.Provider>
  );
};

export const useBallisticsStoreContext = (): BallisticsState => {
  const store = useContext(BallisticsStoreContext);
  if (!store) {
    throw new Error('useBallisticsStore must be used within a BallisticsStoreProvider');
  }
  return store as unknown as BallisticsState;
};

export default BallisticsStoreContext;
