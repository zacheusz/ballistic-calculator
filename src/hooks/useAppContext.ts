import { useContext } from 'react';
import AppContext from '../context/AppContext.tsx';

// Define types for the AppContext value
export interface AppContextValue {
  apiKey: string;
  environment: string;
  unitPreferences: Record<string, string>;
  firearmProfile: any; // Replace with specific type if available
  ammo: any; // Replace with specific type if available
  calculationOptions: {
    calculateSpinDrift: boolean;
    calculateCoriolisEffect: boolean;
    calculateAeroJump: boolean;
    rangeCardStart: { value: number; unit: string };
    rangeCardStep: { value: number; unit: string };
  };
  displayPreferences: {
    theme?: string;
    [key: string]: any;
  };
  isConfigured: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  updateApiKey: (key: string) => void;
  updateEnvironment: (env: string) => void;
  updateUnitPreferences: (prefs: Record<string, string>) => void;
  updateFirearmProfile: (profile: any) => void; // Replace with specific type if available
  updateAmmo: (ammo: any) => void; // Replace with specific type if available
  updateCalculationOptions: (options: any) => void;
  updateDisplayPreferences: (prefs: any) => void;
}

/**
 * Custom hook to access the AppContext
 * @returns {AppContextValue} The AppContext value
 * @throws {Error} If used outside of AppProvider
 */
export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default useAppContext;
