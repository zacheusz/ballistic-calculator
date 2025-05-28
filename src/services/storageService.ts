/**
 * Storage Service
 * 
 * This service provides a more robust way to interact with localStorage
 * to avoid caching issues and ensure data consistency.
 */

export interface StorageKeys {
  API_KEY: string;
  API_ENVIRONMENT: string;
  UNIT_PREFERENCES: string;
  FIREARM_PROFILE: string;
  AMMO: string;
  CALCULATION_OPTIONS: string;
  THEME: string;
}

// Storage keys
export const STORAGE_KEYS: StorageKeys = {
  API_KEY: 'snipe_ballistics_api_key',
  API_ENVIRONMENT: 'snipe_ballistics_api_environment',
  UNIT_PREFERENCES: 'snipe_ballistics_unit_preferences',
  FIREARM_PROFILE: 'snipe_ballistics_firearm_profile',
  AMMO: 'snipe_ballistics_ammo',
  CALCULATION_OPTIONS: 'snipe_ballistics_calculation_options',
  THEME: 'snipe_ballistics_theme',
};

/**
 * Save data to localStorage with proper error handling
 * @param key - The key to store the data under
 * @param data - The data to store (will be JSON stringified for objects)
 * @returns Whether the operation was successful
 */
export const saveToStorage = (key: string, data: any): boolean => {
  try {
    // First clear any existing data
    localStorage.removeItem(key);
    
    // Check if the data is a simple string value (not requiring JSON)
    if (key === STORAGE_KEYS.API_KEY || 
        key === STORAGE_KEYS.API_ENVIRONMENT || 
        key === STORAGE_KEYS.THEME) {
      // Save string directly to localStorage
      localStorage.setItem(key, data as string);
      console.log(`Successfully saved ${key} to localStorage:`, data);
      return true;
    }
    
    // Otherwise convert data to JSON string
    const dataString = JSON.stringify(data);
    
    // Save to localStorage
    localStorage.setItem(key, dataString);
    
    // Verify the data was saved correctly
    const savedData = localStorage.getItem(key);
    if (!savedData) {
      console.error(`Failed to save ${key} to localStorage`);
      return false;
    }
    
    // Parse the saved data to verify it matches what we tried to save
    const parsedData = JSON.parse(savedData);
    console.log(`Successfully saved ${key} to localStorage:`, parsedData);
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    return false;
  }
};

/**
 * Load data from localStorage with proper error handling
 * @param key - The key to load the data from
 * @param defaultValue - The default value to return if the key doesn't exist
 * @returns The loaded data or the default value
 */
export const loadFromStorage = <T>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      console.log(`No data found for ${key} in localStorage, using default value`);
      return defaultValue;
    }
    
    // Check if the data is a simple string value (not JSON)
    if (key === STORAGE_KEYS.API_KEY || 
        key === STORAGE_KEYS.API_ENVIRONMENT || 
        key === STORAGE_KEYS.THEME) {
      console.log(`Successfully loaded ${key} from localStorage:`, data);
      return data as unknown as T;
    }
    
    // Otherwise parse as JSON
    const parsedData = JSON.parse(data) as T;
    console.log(`Successfully loaded ${key} from localStorage:`, parsedData);
    return parsedData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Clear a specific key from localStorage
 * @param key - The key to clear
 * @returns Whether the operation was successful
 */
export const clearFromStorage = (key: string): boolean => {
  try {
    localStorage.removeItem(key);
    console.log(`Successfully cleared ${key} from localStorage`);
    return true;
  } catch (error) {
    console.error(`Error clearing ${key} from localStorage:`, error);
    return false;
  }
};

/**
 * Clear all data from localStorage
 * @returns Whether the operation was successful
 */
export const clearAllStorage = (): boolean => {
  try {
    localStorage.clear();
    console.log('Successfully cleared all localStorage');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

const storageService = {
  saveToStorage,
  loadFromStorage,
  clearFromStorage,
  clearAllStorage,
  STORAGE_KEYS,
};

export default storageService;
