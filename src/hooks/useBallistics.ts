import { useCallback } from 'react';
import useBallisticsStore from '../stores/useBallisticsStore';
import { convertMeasurement, convertUnit } from '../utils/unitConversion';
import { FirearmProfile, Ammo, Atmosphere, Shot, WindSegment } from '../types/ballistics';

/**
 * Hook to access and update ballistics state with type safety
 */
export const useBallistics = () => {
  // Get the entire store state
  const state = useBallisticsStore();
  
  // Helper function to create an updater that preserves unit information
  const createUpdater = <T extends Record<string, any>>(updater: (partial: Partial<T>) => void) => {
    return (updates: Partial<T> | ((current: T) => Partial<T>)) => {
      if (typeof updates === 'function') {
        updater(updates(state as unknown as T));
      } else {
        updater(updates);
      }
    };
  };

  // Create typed updaters for each part of the state
  const updateFirearmProfile = createUpdater<{ firearmProfile: FirearmProfile }>(
    (updates) => state.updateFirearmProfile(updates.firearmProfile!)
  );

  const updateAmmo = createUpdater<{ ammo: Ammo }>(
    (updates) => state.updateAmmo(updates.ammo!)
  );

  const updateAtmosphere = createUpdater<{ atmosphere: Atmosphere }>(
    (updates) => state.updateAtmosphere(updates.atmosphere!)
  );

  const updateShot = createUpdater<{ shot: Shot }>(
    (updates) => state.updateShot(updates.shot!)
  );

  // Helper to update a specific wind segment
  const updateWindSegment = useCallback((index: number, updates: Partial<WindSegment>) => {
    const currentSegments = [...state.shot.windSegments];
    if (index >= 0 && index < currentSegments.length) {
      currentSegments[index] = { ...currentSegments[index], ...updates };
      state.updateShot({ windSegments: currentSegments });
    }
  }, [state]);

  // Helper to add a new wind segment
  const addWindSegment = useCallback((segment: WindSegment) => {
    const currentSegments = [...state.shot.windSegments, segment];
    state.updateShot({ windSegments: currentSegments });
  }, [state]);

  // Helper to remove a wind segment by index
  const removeWindSegment = useCallback((index: number) => {
    const currentSegments = [...state.shot.windSegments];
    if (index >= 0 && index < currentSegments.length) {
      currentSegments.splice(index, 1);
      state.updateShot({ windSegments: currentSegments });
    }
  }, [state]);

  // Helper to convert a measurement to a specific unit
  const convertToUnit = useCallback((value: number, fromUnit: string, toUnit: string): number => {
    // Use the imported utility function from unitConversion
    return convertUnit(value, fromUnit, toUnit);
  }, []);

  // Helper to convert a measurement object to a specific unit
  const convertMeasurementObj = useCallback((measurement: { value: number; unit: string }, toUnit: string) => {
    if (!measurement) return { value: 0, unit: toUnit };
    // Use the imported utility function from unitConversion
    return convertMeasurement(measurement, toUnit);
  }, []);

  // Return everything needed by components
  return {
    // State
    ...state,
    
    // Updaters
    updateFirearmProfile,
    updateAmmo,
    updateAtmosphere,
    updateShot,
    updateWindSegment,
    addWindSegment,
    removeWindSegment,
    
    // Helpers
    convertToUnit,
    convertMeasurement: convertMeasurementObj,
    
    // Alias for compatibility
    setFirearmProfile: updateFirearmProfile,
    setAmmo: updateAmmo,
    setAtmosphere: updateAtmosphere,
    setShot: updateShot,
  };
};

// Re-export the store hook for direct access when needed
export { default as useBallisticsStore } from '../stores/useBallisticsStore';

export default useBallistics;
