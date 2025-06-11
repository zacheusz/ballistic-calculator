import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BallisticsState } from '../types/ballistics';
import { getDefaultConfig, toApiRequest, mergeWithDefaults } from '../utils/ballisticsUtils';

// Storage key for the ballistics store
const STORAGE_KEY = 'ballistics-store-v3';

const useBallisticsStore = create<BallisticsState>()(
  persist(
    (set, get) => {
      const defaultConfig = getDefaultConfig();
      
      return {
        // State
        firearmProfile: defaultConfig.firearmProfile,
        ammo: defaultConfig.ammo,
        atmosphere: defaultConfig.atmosphere,
        shot: defaultConfig.shot,
        preferences: defaultConfig.preferences,
        zeroAtmosphere: defaultConfig.zeroAtmosphere,
        // No version tracking needed
        
        // Actions
        updateFirearmProfile: (updates) =>
          set((state) => ({
            firearmProfile: mergeWithDefaults(state.firearmProfile, updates),
          })),
          
        updateAmmo: (updates) =>
          set((state) => ({
            ammo: mergeWithDefaults(state.ammo, updates),
          })),
          
        updateAtmosphere: (updates) =>
          set((state) => ({
            atmosphere: mergeWithDefaults(state.atmosphere, updates),
          })),
          
        updateShot: (updates) =>
          set((state) => ({
            shot: mergeWithDefaults(state.shot, updates),
          })),
          
        updatePreferences: (updates) =>
          set((state) => ({
            preferences: mergeWithDefaults(state.preferences, updates),
          })),
          
        updateWindSegment: (index, updates) =>
          set((state) => {
            const windSegments = [...state.shot.windSegments];
            if (index >= 0 && index < windSegments.length) {
              windSegments[index] = mergeWithDefaults(windSegments[index], updates);
              return { shot: { ...state.shot, windSegments } };
            }
            return {};
          }),
          
        resetToDefault: () => {
          const defaultConfig = getDefaultConfig();
          set({
            firearmProfile: defaultConfig.firearmProfile,
            ammo: defaultConfig.ammo,
            atmosphere: defaultConfig.atmosphere,
            shot: defaultConfig.shot,
            preferences: defaultConfig.preferences,
            zeroAtmosphere: defaultConfig.zeroAtmosphere,
          });
        },
        
        toApiRequest: () => {
          const state = get();
          return toApiRequest({
            firearmProfile: state.firearmProfile,
            ammo: state.ammo,
            atmosphere: state.atmosphere,
            shot: state.shot,
            preferences: state.preferences,
            zeroAtmosphere: state.zeroAtmosphere,
          });
        },
      };
    },
    {
      name: STORAGE_KEY,
      // No version tracking needed
      // Only persist specific parts of the state
      partialize: (state) => ({
        firearmProfile: state.firearmProfile,
        ammo: state.ammo,
        atmosphere: state.atmosphere,
        shot: state.shot,
        preferences: state.preferences,
        zeroAtmosphere: state.zeroAtmosphere,
        // No version tracking needed
      }),
      // Merge persisted state with default state
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState;
        
        const defaultConfig = getDefaultConfig();
        
        // Extract the state to merge from the persisted state
        // This handles both direct state objects and nested state.state objects
        const stateToMerge = persistedState.state || persistedState;
        
        console.log('Merging persisted state:', stateToMerge);
        
        // Always merge with defaults regardless of version
        const mergedState = {
          ...currentState,
          firearmProfile: mergeWithDefaults(
            defaultConfig.firearmProfile,
            stateToMerge.firearmProfile || {}
          ),
          ammo: mergeWithDefaults(
            defaultConfig.ammo,
            stateToMerge.ammo || {}
          ),
          atmosphere: mergeWithDefaults(
            defaultConfig.atmosphere,
            stateToMerge.atmosphere || {}
          ),
          shot: mergeWithDefaults(
            defaultConfig.shot,
            stateToMerge.shot || {}
          ),
          preferences: mergeWithDefaults(
            defaultConfig.preferences,
            stateToMerge.preferences || {}
          ),
          zeroAtmosphere: stateToMerge.zeroAtmosphere 
            ? mergeWithDefaults(
                defaultConfig.zeroAtmosphere || defaultConfig.atmosphere,
                stateToMerge.zeroAtmosphere
              )
            : defaultConfig.zeroAtmosphere
        };
        
        console.log('Merged state:', mergedState);
        return mergedState;
      },

    }
  )
);

// Export the BallisticsState type for use in other files
export type { BallisticsState } from '../types/ballistics';

export default useBallisticsStore;
