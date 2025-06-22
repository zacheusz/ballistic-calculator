import { useCallback } from 'react';
import useBallisticsStore from '../stores/useBallisticsStore';
import { convertMeasurement, convertUnit } from '../utils/unitConversion';
import { Unit } from '../types/ballistics';

/**
 * Hook to access and update ballistics state with type safety
 * Uses selective subscriptions to prevent unnecessary re-renders
 */
export const useBallistics = () => {
  // Subscribe to individual state slices instead of the entire state
  const firearmProfile = useBallisticsStore(state => state.firearmProfile);
  const ammo = useBallisticsStore(state => state.ammo);
  const atmosphere = useBallisticsStore(state => state.atmosphere);
  const shot = useBallisticsStore(state => state.shot);
  const preferences = useBallisticsStore(state => state.preferences);
  const zeroAtmosphere = useBallisticsStore(state => state.zeroAtmosphere);
  
  // Subscribe to actions (these don't cause re-renders as they're stable references)
  const updateFirearmProfile = useBallisticsStore(state => state.updateFirearmProfile);
  const updateAmmo = useBallisticsStore(state => state.updateAmmo);
  const updateAtmosphere = useBallisticsStore(state => state.updateAtmosphere);
  const updateShot = useBallisticsStore(state => state.updateShot);
  const updatePreferences = useBallisticsStore(state => state.updatePreferences);
  const updateWindSegment = useBallisticsStore(state => state.updateWindSegment);
  const addWindSegment = useBallisticsStore(state => state.addWindSegment);
  const removeWindSegment = useBallisticsStore(state => state.removeWindSegment);
  const resetToDefault = useBallisticsStore(state => state.resetToDefault);
  const toApiRequest = useBallisticsStore(state => state.toApiRequest);

  // Helper to convert a measurement to a specific unit
  const convertToUnit = useCallback((value: number, fromUnit: Unit, toUnit: Unit): number => {
    return convertUnit(value, fromUnit, toUnit);
  }, []);

  // Helper to convert a measurement object to a specific unit
  const convertMeasurementObj = useCallback((measurement: { value: number; unit: Unit }, toUnit: Unit) => {
    if (!measurement) return { value: 0, unit: toUnit };
    return convertMeasurement(measurement, toUnit);
  }, []);

  // Return everything needed by components
  return {
    // State - individual slices
    firearmProfile,
    ammo,
    atmosphere,
    shot,
    preferences,
    zeroAtmosphere,
    
    // Actions - direct from store
    updateFirearmProfile,
    updateAmmo,
    updateAtmosphere,
    updateShot,
    updatePreferences,
    updateWindSegment,
    addWindSegment,
    removeWindSegment,
    resetToDefault,
    toApiRequest,
    
    // Utility functions
    convertToUnit,
    convertMeasurement: convertMeasurementObj,
  };
};

// Re-export the store hook for direct access when needed
export { default as useBallisticsStore } from '../stores/useBallisticsStore';

export default useBallistics;
