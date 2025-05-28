/**
 * Type definitions for storageService.js
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

export const STORAGE_KEYS: StorageKeys;

/**
 * Save data to localStorage with proper error handling
 * @param key - The key to store the data under
 * @param data - The data to store (will be JSON stringified for objects)
 * @returns Whether the operation was successful
 */
export function saveToStorage(key: string, data: any): boolean;

/**
 * Load data from localStorage with proper error handling
 * @param key - The key to load the data from
 * @param defaultValue - The default value to return if the key doesn't exist
 * @returns The loaded data or the default value
 */
export function loadFromStorage<T>(key: string, defaultValue?: T | null): T | null;

/**
 * Clear a specific key from localStorage
 * @param key - The key to clear
 * @returns Whether the operation was successful
 */
export function clearFromStorage(key: string): boolean;

/**
 * Clear all data from localStorage
 * @returns Whether the operation was successful
 */
export function clearAllStorage(): boolean;

declare const storageService: {
  saveToStorage: typeof saveToStorage;
  loadFromStorage: typeof loadFromStorage;
  clearFromStorage: typeof clearFromStorage;
  clearAllStorage: typeof clearAllStorage;
  STORAGE_KEYS: typeof STORAGE_KEYS;
};

export default storageService;
