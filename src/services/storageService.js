/**
 * Storage Service
 * 
 * This service provides a more robust way to interact with localStorage
 * to avoid caching issues and ensure data consistency.
 */

/**
 * Save data to localStorage with proper error handling
 * @param {string} key - The key to store the data under
 * @param {any} data - The data to store (will be JSON stringified for objects)
 * @returns {boolean} - Whether the operation was successful
 */
export const saveToStorage = (key, data) => {
  try {
    // First clear any existing data
    localStorage.removeItem(key);
    
    // Check if the data is a simple string value (not requiring JSON)
    if (key === STORAGE_KEYS.API_KEY || 
        key === STORAGE_KEYS.API_ENVIRONMENT || 
        key === STORAGE_KEYS.THEME) {
      // Save string directly to localStorage
      localStorage.setItem(key, data);
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
 * @param {string} key - The key to load the data from
 * @param {any} defaultValue - The default value to return if the key doesn't exist
 * @returns {any} - The loaded data or the default value
 */
export const loadFromStorage = (key, defaultValue = null) => {
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
      return data;
    }
    
    // Otherwise parse as JSON
    const parsedData = JSON.parse(data);
    console.log(`Successfully loaded ${key} from localStorage:`, parsedData);
    return parsedData;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * Clear a specific key from localStorage
 * @param {string} key - The key to clear
 * @returns {boolean} - Whether the operation was successful
 */
export const clearFromStorage = (key) => {
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
 * @returns {boolean} - Whether the operation was successful
 */
export const clearAllStorage = () => {
  try {
    localStorage.clear();
    console.log('Successfully cleared all localStorage');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    return false;
  }
};

// Storage keys
export const STORAGE_KEYS = {
  API_KEY: 'snipe_ballistics_api_key',
  API_ENVIRONMENT: 'snipe_ballistics_api_environment',
  UNIT_PREFERENCES: 'snipe_ballistics_unit_preferences',
  FIREARM_PROFILE: 'snipe_ballistics_firearm_profile',
  AMMO: 'snipe_ballistics_ammo',
  CALCULATION_OPTIONS: 'snipe_ballistics_calculation_options',
  THEME: 'snipe_ballistics_theme',
};

export default {
  saveToStorage,
  loadFromStorage,
  clearFromStorage,
  clearAllStorage,
  STORAGE_KEYS,
};
