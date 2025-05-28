import axios, { AxiosInstance } from 'axios';
import configService from './configService';
import { UnitPreferences } from '../types/ballistics';

// Define interfaces for the class properties
interface BallisticsApiConfig {
  apiBaseUrl: string;
  apiKey: string;
  environment: string;
  unitPreferences: UnitPreferences;
  client: AxiosInstance;
}

// Define interface for the compute ballistic solution request
interface ComputeBallisticSolutionConfig {
  [key: string]: any; // This can be more specific based on your API requirements
}

// Define interface for system info response
interface SystemInfoResponse {
  [key: string]: any; // This can be more specific based on your API response
}

// Define interface for Zustand store state structure
interface BallisitcsStoreState {
  state: {
    preferences: {
      unitPreferences: UnitPreferences;
    };
  };
}

class BallisticsApi implements BallisticsApiConfig {
  apiBaseUrl: string;
  apiKey: string;
  environment: string;
  unitPreferences: UnitPreferences;
  client!: AxiosInstance; // Using definite assignment assertion

  constructor() {
    // Debug log environment variables
    console.log('Environment variables:', {
      VITE_API_STAGE: import.meta.env.VITE_API_STAGE,
      VITE_API_ENDPOINT: import.meta.env.VITE_API_ENDPOINT,
      MODE: import.meta.env.MODE,
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD
    });

    // Set the API base URL from environment variable or use default
    this.apiBaseUrl = import.meta.env.VITE_API_ENDPOINT || 'https://api.calculator.snipe.technology';
    
    // Load API key from localStorage
    this.apiKey = localStorage.getItem('snipe_ballistics_api_key') || '';
    
    // Use environment from Zustand store if available, otherwise use VITE_API_STAGE or 'prod' as default
    // Note: This will be updated by AppContext when the Zustand store is loaded
    this.environment = import.meta.env.VITE_API_STAGE || 'prod';
    
    // Log the final configuration
    console.log('API Configuration:', {
      environment: this.environment,
      apiBaseUrl: this.apiBaseUrl,
      fullUrl: `${this.apiBaseUrl}/${this.environment}`,
      source: localStorage.getItem('snipe_ballistics_api_environment') ? 'localStorage' : 'environment variable'
    });
    
    this.unitPreferences = JSON.parse(localStorage.getItem('snipe_ballistics_unit_preferences') || 'null') || this.getDefaultUnitPreferences();
    this.updateClient();
  }
  
  getDefaultUnitPreferences(): UnitPreferences {
    return configService.getDefaultUnitPreferences();
  }
  
  updateClient(): void {
    const BASE_URL = `${this.apiBaseUrl}/${this.environment}`;
    console.log(`Initializing API client with base URL: ${BASE_URL}`);
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem('snipe_ballistics_api_key', apiKey);
  }

  getApiKey(): string {
    return this.apiKey;
  }
  
  setEnvironment(environment: string): void {
    this.environment = environment;
    // No longer storing in localStorage as we're using Zustand store as the single source of truth
    this.updateClient();
  }
  
  getEnvironment(): string {
    return this.environment;
  }
  
  setUnitPreferences(unitPreferences: UnitPreferences): void {
    this.unitPreferences = unitPreferences;
    localStorage.setItem('snipe_ballistics_unit_preferences', JSON.stringify(unitPreferences));
  }
  
  getUnitPreferences(): UnitPreferences {
    return this.unitPreferences;
  }
  
  getUnitPreferencesForApi(): UnitPreferences {
    // First, check if we have valid unit preferences in localStorage
    // This is where the Zustand store persists its state
    try {
      // Get the Zustand store state from localStorage
      const storedState = JSON.parse(localStorage.getItem('ballistics-store-v2') || '{}') as BallisitcsStoreState;
      
      // Check if we have valid unit preferences in the stored state
      if (storedState.state && 
          storedState.state.preferences && 
          storedState.state.preferences.unitPreferences && 
          storedState.state.preferences.unitPreferences.unitMappings && 
          Array.isArray(storedState.state.preferences.unitPreferences.unitMappings) && 
          storedState.state.preferences.unitPreferences.unitMappings.length > 0) {
        
        console.log('Using unit preferences from Zustand store (via localStorage):', 
                   storedState.state.preferences.unitPreferences);
        
        // Update our instance variable to keep it in sync
        this.unitPreferences = storedState.state.preferences.unitPreferences;
        return storedState.state.preferences.unitPreferences;
      }
    } catch (error) {
      console.error('Error accessing Zustand store state from localStorage:', error);
      // Continue to fallback mechanisms if there's an error
    }
    
    // If we have valid instance preferences, use those as a fallback
    if (this.unitPreferences && this.unitPreferences.unitMappings && 
        Array.isArray(this.unitPreferences.unitMappings) && 
        this.unitPreferences.unitMappings.length > 0) {
      console.log('Using instance unit preferences as fallback:', this.unitPreferences);
      return this.unitPreferences;
    }
    
    // Fall back to default preferences from configService
    // The configService loads defaults from default.json
    const defaultPreferences = configService.getDefaultUnitPreferences();
    console.log('Using default unit preferences from configService:', defaultPreferences);
    
    if (defaultPreferences && defaultPreferences.unitMappings && 
        Array.isArray(defaultPreferences.unitMappings) && 
        defaultPreferences.unitMappings.length > 0) {
      return defaultPreferences;
    }
    
    // If all else fails, log an error and return an empty structure
    console.error('Failed to get unit preferences from any source');
    return { unitMappings: [] };
  }

  async computeBallisticSolution(config: ComputeBallisticSolutionConfig): Promise<any> {
    try {
      const response = await this.client.post('/compute', config, {
        headers: {
          'x-api-key': this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error computing ballistic solution:', error);
      throw error;
    }
  }

  async getSystemInfo(): Promise<SystemInfoResponse> {
    try {
      const response = await this.client.get('/info', {
        headers: {
          'x-api-key': this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error getting system info:', error);
      throw error;
    }
  }
}

export default new BallisticsApi();
