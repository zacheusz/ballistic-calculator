import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import configService from '../services/configService';
import storageService, { STORAGE_KEYS } from '../services/storageService';

const AppContext = createContext();

// Get default values from configuration service
const defaultFirearmProfile = configService.getDefaultFirearmProfile();

const defaultAmmo = configService.getDefaultAmmo();

const defaultCalculationOptions = configService.getDefaultCalculationOptions();

const defaultDisplayPreferences = {
  theme: localStorage.getItem('snipe_ballistics_theme') || 'dark',
};

export const AppProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  // Initialize with empty string, will be set from localStorage or API service in useEffect
  const [environment, setEnvironment] = useState('');
  const [unitPreferences, setUnitPreferences] = useState(api.getDefaultUnitPreferences());
  const [firearmProfile, setFirearmProfile] = useState(defaultFirearmProfile);
  const [ammo, setAmmo] = useState(defaultAmmo);
  const [calculationOptions, setCalculationOptions] = useState(defaultCalculationOptions);
  const [displayPreferences, setDisplayPreferences] = useState(defaultDisplayPreferences);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on initial load using the storage service
    const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
    // Load settings from localStorage first, then fall back to API service defaults
    const savedUnitPreferences = storageService.loadFromStorage(STORAGE_KEYS.UNIT_PREFERENCES, null);
    const savedFirearmProfile = storageService.loadFromStorage(STORAGE_KEYS.FIREARM_PROFILE, null);
    const savedAmmo = storageService.loadFromStorage(STORAGE_KEYS.AMMO, null);
    const savedCalculationOptions = storageService.loadFromStorage(STORAGE_KEYS.CALCULATION_OPTIONS, null);
    const savedTheme = storageService.loadFromStorage(STORAGE_KEYS.THEME, 'light');
    
    // Get environment from localStorage or use the one from API service (which falls back to env var)
    const savedEnvironment = storageService.loadFromStorage(STORAGE_KEYS.API_ENVIRONMENT, api.environment);
    setEnvironment(savedEnvironment);
    
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
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsConfigured(true);
      api.setApiKey(savedApiKey);
    }
    
    // Apply theme from localStorage or default to light
    const themeToApply = savedTheme;
    setDisplayPreferences(prev => ({ ...prev, theme: themeToApply }));
    document.documentElement.setAttribute('data-bs-theme', themeToApply);
    document.body.setAttribute('data-bs-theme', themeToApply);
    console.log('Initial theme applied:', themeToApply);
  }, []);

  const updateApiKey = (newApiKey) => {
    setApiKey(newApiKey);
    storageService.saveToStorage(STORAGE_KEYS.API_KEY, newApiKey);
    setIsConfigured(true);
    api.setApiKey(newApiKey);
  };
  
  const updateEnvironment = (newEnvironment) => {
    setEnvironment(newEnvironment);
    storageService.saveToStorage(STORAGE_KEYS.API_ENVIRONMENT, newEnvironment);
    api.setEnvironment(newEnvironment);
  };
  
  const updateUnitPreferences = (newUnitPreferences) => {
    setUnitPreferences(newUnitPreferences);
    storageService.saveToStorage(STORAGE_KEYS.UNIT_PREFERENCES, newUnitPreferences);
    api.setUnitPreferences(newUnitPreferences);
  };
  
  const updateFirearmProfile = (newFirearmProfile) => {
    setFirearmProfile(newFirearmProfile);
    storageService.saveToStorage(STORAGE_KEYS.FIREARM_PROFILE, newFirearmProfile);
  };
  
  const updateAmmo = (newAmmo) => {
    setAmmo(newAmmo);
    storageService.saveToStorage(STORAGE_KEYS.AMMO, newAmmo);
  };
  
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
    storageService.saveToStorage(STORAGE_KEYS.THEME, newPreferences.theme);
    // Apply theme to both HTML and body elements for better compatibility
    document.documentElement.setAttribute('data-bs-theme', newPreferences.theme);
    document.body.setAttribute('data-bs-theme', newPreferences.theme);
    console.log('Theme updated to:', newPreferences.theme);
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

export const useAppContext = () => useContext(AppContext);

export default AppContext;
