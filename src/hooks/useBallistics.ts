import { useCallback } from 'react';
import useBallisticsStore from '../stores/useBallisticsStore';
import { convertMeasurement, convertUnit } from '../utils/unitConversion';
import { FirearmProfile, Ammo, Atmosphere, Shot, WindSegment, Unit } from '../types/ballistics';

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
  const resetToDefault = useBallisticsStore(state => state.resetToDefault);
  const toApiRequest = useBallisticsStore(state => state.toApiRequest);

  // Helper function to create an updater that preserves unit information
  const createUpdater = <T extends Record<string, any>>(updater: (partial: Partial<T>) => void) => {
    return (updates: Partial<T> | ((current: T) => Partial<T>)) => {
      if (typeof updates === 'function') {
        const currentState = { firearmProfile, ammo, atmosphere, shot, preferences, zeroAtmosphere };
        updater(updates(currentState as unknown as T));
      } else {
        updater(updates);
      }
    };
  };

  // Create typed updaters for each part of the state
  const updateFirearmProfileTyped = createUpdater<{ firearmProfile: FirearmProfile }>(
    (updates) => updateFirearmProfile(updates.firearmProfile!)
  );

  const updateAmmoTyped = createUpdater<{ ammo: Ammo }>(
    (updates) => updateAmmo(updates.ammo!)
  );

  const updateAtmosphereTyped = createUpdater<{ atmosphere: Atmosphere }>(
    (updates) => updateAtmosphere(updates.atmosphere!)
  );

  const updateShotTyped = createUpdater<{ shot: Shot }>(
    (updates) => updateShot(updates.shot!)
  );

  // Helper to add a new wind segment
  const addWindSegment = useCallback((segment: WindSegment) => {
    // Get current wind segments and add the new one
    const currentSegments = useBallisticsStore.getState().shot.windSegments;
    updateShot({ windSegments: [...currentSegments, segment] });
  }, [updateShot]);

  // Helper to remove a wind segment by index
  const removeWindSegment = useCallback((index: number) => {
    // Get current wind segments and remove the specified one
    const currentSegments = useBallisticsStore.getState().shot.windSegments;
    if (index >= 0 && index < currentSegments.length) {
      const newSegments = [...currentSegments];
      newSegments.splice(index, 1);
      updateShot({ windSegments: newSegments });
    }
  }, [updateShot]);

  // Helper to convert a measurement to a specific unit
  const convertToUnit = useCallback((value: number, fromUnit: Unit, toUnit: Unit): number => {
    // Use the imported utility function from unitConversion
    return convertUnit(value, fromUnit, toUnit);
  }, []);

  // Helper to convert a measurement object to a specific unit
  const convertMeasurementObj = useCallback((measurement: { value: number; unit: Unit }, toUnit: Unit) => {
    if (!measurement) return { value: 0, unit: toUnit };
    // Use the imported utility function from unitConversion
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
    
    // Updaters
    updateFirearmProfile: updateFirearmProfileTyped,
    updateAmmo: updateAmmoTyped,
    updateAtmosphere: updateAtmosphereTyped,
    updateShot: updateShotTyped,
    updatePreferences,
    updateWindSegment,
    addWindSegment,
    removeWindSegment,
    resetToDefault,
    toApiRequest,
    
    // Helpers
    convertToUnit,
    convertMeasurement: convertMeasurementObj,
    
    // Alias for compatibility
    setFirearmProfile: updateFirearmProfileTyped,
    setAmmo: updateAmmoTyped,
    setAtmosphere: updateAtmosphereTyped,
    setShot: updateShotTyped,
  };
};

// Re-export the store hook for direct access when needed
export { default as useBallisticsStore } from '../stores/useBallisticsStore';

export default useBallistics;
