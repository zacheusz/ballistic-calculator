import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BallisticsState, FirearmProfile, Ammo, Atmosphere, Shot, Preferences, WindSegment } from '../types/ballistics';
import { getDefaultConfig, toApiRequest, mergeWithDefaults } from '../utils/ballisticsUtils';

const STORAGE_KEY = 'ballistics-store-v2';

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
      // Only persist specific parts of the state
      partialize: (state) => ({
        firearmProfile: state.firearmProfile,
        ammo: state.ammo,
        atmosphere: state.atmosphere,
        shot: state.shot,
        preferences: state.preferences,
        zeroAtmosphere: state.zeroAtmosphere,
      }),
      // Merge persisted state with default state
      merge: (persistedState: any, currentState) => {
        if (!persistedState) return currentState;
        
        // If we have a version mismatch, use default config
        if (persistedState._version !== 2) {
          console.log('Version mismatch detected, using default configuration');
          return {
            ...currentState,
            ...getDefaultConfig(),
            _version: 2
          };
        }
        
        const defaultConfig = getDefaultConfig();
        
        return {
          ...currentState,
          firearmProfile: mergeWithDefaults(
            defaultConfig.firearmProfile,
            persistedState.firearmProfile || {}
          ),
          ammo: mergeWithDefaults(
            defaultConfig.ammo,
            persistedState.ammo || {}
          ),
          atmosphere: mergeWithDefaults(
            defaultConfig.atmosphere,
            persistedState.atmosphere || {}
          ),
          shot: mergeWithDefaults(
            defaultConfig.shot,
            persistedState.shot || {}
          ),
          preferences: mergeWithDefaults(
            defaultConfig.preferences,
            persistedState.preferences || {}
          ),
          zeroAtmosphere: persistedState.zeroAtmosphere 
            ? mergeWithDefaults(
                defaultConfig.zeroAtmosphere || defaultConfig.atmosphere,
                persistedState.zeroAtmosphere
              )
            : undefined,
          _version: 2
        };
      },
    }
  )
);

// Export the BallisticsState type for use in other files
export type { BallisticsState } from '../types/ballistics';

export default useBallisticsStore;
