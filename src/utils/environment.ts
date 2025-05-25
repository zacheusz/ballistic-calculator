/**
 * Environment utility to access Vite environment variables in a way that's compatible with tests
 */

// Default values for environment variables
const defaults = {
  apiStage: 'prod',
  apiEndpoint: 'https://api.calculator.snipe.technology'
};

// In a real browser environment, these will be overridden with actual values
// In tests, Jest will automatically use the mock implementation
export const getApiStage = (): string => defaults.apiStage;
export const getApiEndpoint = (): string => defaults.apiEndpoint;

// Only run this in the browser environment, not in tests
if (typeof window !== 'undefined') {
  try {
    // Override defaults with actual environment variables if available
    if (import.meta?.env?.VITE_API_STAGE) {
      defaults.apiStage = import.meta.env.VITE_API_STAGE;
    }
    if (import.meta?.env?.VITE_API_ENDPOINT) {
      defaults.apiEndpoint = import.meta.env.VITE_API_ENDPOINT;
    }
  } catch (e) {
    console.warn('Error accessing environment variables:', e);
  }
}
