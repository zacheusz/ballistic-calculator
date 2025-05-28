import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import configService from '../services/configService.ts';
import storageService, { STORAGE_KEYS } from '../services/storageService';
import { useAppConfigStore } from '../stores/useAppConfigStore';

const AppContext = createContext();

// Get default values from configuration service
const defaultFirearmProfile = configService.getDefaultFirearmProfile();

const defaultAmmo = configService.getDefaultAmmo();

const defaultCalculationOptions = configService.getDefaultCalculationOptions();

// Display preferences no longer include theme as it's managed by Zustand
const defaultDisplayPreferences = {};

export const AppProvider = ({ children }) => {
  // Get API key and stage from Zustand store
  const zustandApiKey = useAppConfigStore(state => state.apiKey);
  const zustandApiStage = useAppConfigStore(state => state.apiStage);
  
  const [apiKey, setApiKey] = useState('');
  // Initialize with empty string, will be set from localStorage or API service in useEffect
  const [environment, setEnvironment] = useState('');
  const [unitPreferences, setUnitPreferences] = useState(api.getDefaultUnitPreferences());
  // Using _ prefix to indicate these state setters are intentionally unused but kept for future use
  const [firearmProfile, setFirearmProfile] = useState(defaultFirearmProfile);
  const [ammo, setAmmo] = useState(defaultAmmo);
  const [calculationOptions, setCalculationOptions] = useState(defaultCalculationOptions);
  const [displayPreferences, setDisplayPreferences] = useState(defaultDisplayPreferences);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define update functions before they are used in useEffect
  const updateFirearmProfile = useCallback((newFirearmProfile) => {
    setFirearmProfile(newFirearmProfile);
    storageService.saveToStorage(STORAGE_KEYS.FIREARM_PROFILE, newFirearmProfile);
  }, []);
  
  const updateAmmo = useCallback((newAmmo) => {
    setAmmo(newAmmo);
    storageService.saveToStorage(STORAGE_KEYS.AMMO, newAmmo);
  }, []);

  useEffect(() => {
    // Load settings from localStorage on initial load using the storage service
    // We don't use savedApiKey directly as it's now managed by Zustand
    // Load settings from localStorage first, then fall back to API service defaults
    const savedUnitPreferences = storageService.loadFromStorage(STORAGE_KEYS.UNIT_PREFERENCES, null);
    const savedFirearmProfile = storageService.loadFromStorage(STORAGE_KEYS.FIREARM_PROFILE, null);
    const savedAmmo = storageService.loadFromStorage(STORAGE_KEYS.AMMO, null);
    const savedCalculationOptions = storageService.loadFromStorage(STORAGE_KEYS.CALCULATION_OPTIONS, null);
    // We're now using Zustand store as the single source of truth for the API environment
    // The environment will be set from the Zustand store in the useEffect below
    
    if (savedUnitPreferences) {
      setUnitPreferences(savedUnitPreferences);
    }
    
    if (savedFirearmProfile) {
      setFirearmProfile(savedFirearmProfile);
    }
    
    if (savedAmmo) {
      setAmmo(savedAmmo);
    }
    
    if (savedCalculationOptions) {
      console.log('Loading calculation options from localStorage:', savedCalculationOptions);
      console.log('Coriolis effect loaded as:', savedCalculationOptions.calculateCoriolisEffect);
      setCalculationOptions(savedCalculationOptions);
    } else {
      console.log('No saved calculation options found, using defaults:', defaultCalculationOptions);
    }
    
    // Theme is now managed by Zustand store
  }, []);

  // Sync with Zustand store when its API key or stage changes
  useEffect(() => {
    if (zustandApiKey) {
      console.log('Syncing API key from Zustand store:', zustandApiKey);
      setApiKey(zustandApiKey);
      setIsConfigured(true);
      api.setApiKey(zustandApiKey);
    }
    if (zustandApiStage) {
      console.log('Syncing API stage from Zustand store:', zustandApiStage);
      setEnvironment(zustandApiStage);
      api.setEnvironment(zustandApiStage);
    }
  }, [zustandApiKey, zustandApiStage]);

  const updateApiKey = (newApiKey) => {
    setApiKey(newApiKey);
    storageService.saveToStorage(STORAGE_KEYS.API_KEY, newApiKey);
    setIsConfigured(true);
    api.setApiKey(newApiKey);
    // No need to update Zustand store here as it's handled in ConfigPage
  };
  
  const updateEnvironment = (newEnvironment) => {
    setEnvironment(newEnvironment);
    // No longer storing in localStorage as we're using Zustand store as the single source of truth
    api.setEnvironment(newEnvironment);
    // We should also update the Zustand store to keep it in sync
    useAppConfigStore.getState().setApiStage(newEnvironment);
  };
  
  const updateUnitPreferences = (newUnitPreferences) => {
    setUnitPreferences(newUnitPreferences);
    storageService.saveToStorage(STORAGE_KEYS.UNIT_PREFERENCES, newUnitPreferences);
    api.setUnitPreferences(newUnitPreferences);
  };
  
  // These functions are already defined above
  
  const updateCalculationOptions = (newCalculationOptions) => {
    console.log('Updating calculation options:', newCalculationOptions);
    
    // Create a clean copy of the options to ensure we're not carrying any unexpected properties
    // Use explicit boolean conversion to ensure proper type
    const cleanOptions = {
      calculateSpinDrift: Boolean(newCalculationOptions.calculateSpinDrift),
      calculateCoriolisEffect: Boolean(newCalculationOptions.calculateCoriolisEffect),
      calculateAeroJump: Boolean(newCalculationOptions.calculateAeroJump),
      rangeCardStart: newCalculationOptions.rangeCardStart,
      rangeCardStep: newCalculationOptions.rangeCardStep
    };
    
    console.log('Clean calculation options to save:', cleanOptions);
    
    // First update the state
    setCalculationOptions(cleanOptions);
    
    // Use the storage service to reliably save to localStorage
    const success = storageService.saveToStorage(STORAGE_KEYS.CALCULATION_OPTIONS, cleanOptions);
    
    if (success) {
      console.log('Coriolis effect saved as:', cleanOptions.calculateCoriolisEffect);
    } else {
      console.error('Failed to save calculation options');
    }
  };

  const updateDisplayPreferences = (newPreferences) => {
    setDisplayPreferences(newPreferences);
    // Theme is now managed by Zustand store
  };

  return (
    <AppContext.Provider
      value={{
        apiKey,
        environment,
        unitPreferences,
        firearmProfile,
        ammo,
        calculationOptions,
        displayPreferences,
        isConfigured,
        loading,
        setLoading,
        updateApiKey,
        updateEnvironment,
        updateUnitPreferences,
        updateFirearmProfile,
        updateAmmo,
        updateCalculationOptions,
        updateDisplayPreferences,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
