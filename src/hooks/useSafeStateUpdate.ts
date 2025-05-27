import { useEffect, useRef } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any

/**
 * Custom hook for safely updating state from external sources
 * Prevents race conditions and unnecessary re-renders
 * 
 * @param value The external value to sync with state
 * @param setState The state setter function
 * @param isUpdatingRef Optional ref to track manual updates
 * @param debugLabel Optional label for debug logs
 * @returns void
 */
export const useSafeStateUpdate = <T extends Record<string, any>>(
  value: T | null | undefined,
  setState: React.Dispatch<React.SetStateAction<T>>,
  isUpdatingRef?: React.RefObject<boolean>,
  debugLabel?: string
): void => {
  // Create a ref to track if this effect instance is still relevant
  const isCurrentlyRunning = useRef(true);
  
  useEffect(() => {
    // Reset the running state to true at the start of each effect run
    isCurrentlyRunning.current = true;
    
    // Skip if we're in the middle of a manual update
    if (isUpdatingRef?.current) {
      console.log(`[DEBUG] Skipping ${debugLabel || 'state'} update because we are manually updating`);
      return;
    }
    
    // Skip if value is empty
    if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) {
      return;
    }
    
    // Log the effect trigger if debug label is provided
    if (debugLabel) {
      console.log(`[DEBUG] ${debugLabel} useEffect triggered`, { value });
    }
    
    setState(prev => {
      // Only proceed if this effect is still relevant
      if (!isCurrentlyRunning.current) return prev;
      
      // Only update if different to prevent unnecessary re-renders
      const prevString = JSON.stringify(prev);
      const nextString = JSON.stringify(value);
      const shouldUpdate = prevString !== nextString;
      
      if (debugLabel) {
        console.log(`[DEBUG] Should update ${debugLabel} state?`, shouldUpdate);
      }
      
      if (shouldUpdate) {
        if (debugLabel) {
          console.log(`[DEBUG] Updating ${debugLabel} state`, value);
        }
        return { ...value };
      }
      return prev;
    });
    
    // Cleanup function to prevent state updates if the dependencies change before the effect completes
    return () => {
      isCurrentlyRunning.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, setState, isUpdatingRef, debugLabel]);
};
