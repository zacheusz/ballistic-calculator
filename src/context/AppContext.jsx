import { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import configService from '../services/configService';

const AppContext = createContext();

// Get default values from configuration service
const defaultFirearmProfile = configService.getDefaultFirearmProfile();

const defaultAmmo = configService.getDefaultAmmo();

const defaultCalculationOptions = configService.getDefaultCalculationOptions();

const defaultDisplayPreferences = {
  theme: localStorage.getItem('snipe_ballistics_theme') || 'light',
};

export const AppProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState('');
  const [environment, setEnvironment] = useState('dev');
  const [unitPreferences, setUnitPreferences] = useState(api.getDefaultUnitPreferences());
  const [firearmProfile, setFirearmProfile] = useState(defaultFirearmProfile);
  const [ammo, setAmmo] = useState(defaultAmmo);
  const [calculationOptions, setCalculationOptions] = useState(defaultCalculationOptions);
  const [displayPreferences, setDisplayPreferences] = useState(defaultDisplayPreferences);
  const [isConfigured, setIsConfigured] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load settings from localStorage on initial load
    const savedApiKey = localStorage.getItem('snipe_ballistics_api_key');
    const savedEnvironment = localStorage.getItem('snipe_ballistics_api_environment') || 'dev';
    const savedUnitPreferences = localStorage.getItem('snipe_ballistics_unit_preferences');
    const savedFirearmProfile = localStorage.getItem('snipe_ballistics_firearm_profile');
    const savedAmmo = localStorage.getItem('snipe_ballistics_ammo');
    const savedCalculationOptions = localStorage.getItem('snipe_ballistics_calculation_options');
    const savedTheme = localStorage.getItem('snipe_ballistics_theme');

    setEnvironment(savedEnvironment);
    
    if (savedUnitPreferences) {
      const parsedPreferences = JSON.parse(savedUnitPreferences);
      setUnitPreferences(parsedPreferences);
    }
    
    if (savedFirearmProfile) {
      const parsedFirearmProfile = JSON.parse(savedFirearmProfile);
      setFirearmProfile(parsedFirearmProfile);
    }
    
    if (savedAmmo) {
      const parsedAmmo = JSON.parse(savedAmmo);
      setAmmo(parsedAmmo);
    }
    
    if (savedCalculationOptions) {
      const parsedCalculationOptions = JSON.parse(savedCalculationOptions);
      setCalculationOptions(parsedCalculationOptions);
    }
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsConfigured(true);
      api.setApiKey(savedApiKey);
    }
    
    // Apply theme from localStorage or default to light
    const themeToApply = savedTheme || 'light';
    setDisplayPreferences(prev => ({ ...prev, theme: themeToApply }));
    document.documentElement.setAttribute('data-bs-theme', themeToApply);
    document.body.setAttribute('data-bs-theme', themeToApply);
    console.log('Initial theme applied:', themeToApply);
  }, []);

  const updateApiKey = (newApiKey) => {
    setApiKey(newApiKey);
    api.setApiKey(newApiKey);
    setIsConfigured(!!newApiKey);
  };
  
  const updateEnvironment = (newEnvironment) => {
    setEnvironment(newEnvironment);
    api.setEnvironment(newEnvironment);
  };
  
  const updateUnitPreferences = (newUnitPreferences) => {
    setUnitPreferences(newUnitPreferences);
    localStorage.setItem('snipe_ballistics_unit_preferences', JSON.stringify(newUnitPreferences));
    api.setUnitPreferences(newUnitPreferences);
  };
  
  const updateFirearmProfile = (newFirearmProfile) => {
    setFirearmProfile(newFirearmProfile);
    localStorage.setItem('snipe_ballistics_firearm_profile', JSON.stringify(newFirearmProfile));
  };
  
  const updateAmmo = (newAmmo) => {
    setAmmo(newAmmo);
    localStorage.setItem('snipe_ballistics_ammo', JSON.stringify(newAmmo));
  };
  
  const updateCalculationOptions = (newCalculationOptions) => {
    setCalculationOptions(newCalculationOptions);
    localStorage.setItem('snipe_ballistics_calculation_options', JSON.stringify(newCalculationOptions));
  };

  const updateDisplayPreferences = (newPreferences) => {
    setDisplayPreferences(newPreferences);
    localStorage.setItem('snipe_ballistics_theme', newPreferences.theme);
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
