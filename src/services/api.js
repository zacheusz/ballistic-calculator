import axios from 'axios';
import configService from './configService';

class BallisticsApi {
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
    
    // Use environment from localStorage if it exists, otherwise use VITE_API_STAGE or 'prod' as default
    this.environment = localStorage.getItem('snipe_ballistics_api_environment') || 
                      import.meta.env.VITE_API_STAGE || 
                      'prod';
    
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
  
  getDefaultUnitPreferences() {
    return configService.getDefaultUnitPreferences();
  }
  
  updateClient() {
    const BASE_URL = `${this.apiBaseUrl}/${this.environment}`;
    console.log(`Initializing API client with base URL: ${BASE_URL}`);
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  setApiKey(apiKey) {
    this.apiKey = apiKey;
    localStorage.setItem('snipe_ballistics_api_key', apiKey);
  }

  getApiKey() {
    return this.apiKey;
  }
  
  setEnvironment(environment) {
    this.environment = environment;
    localStorage.setItem('snipe_ballistics_api_environment', environment);
    this.updateClient();
  }
  
  getEnvironment() {
    return this.environment;
  }
  
  setUnitPreferences(unitPreferences) {
    this.unitPreferences = unitPreferences;
    localStorage.setItem('snipe_ballistics_unit_preferences', JSON.stringify(unitPreferences));
  }
  
  getUnitPreferences() {
    return this.unitPreferences;
  }
  
  getUnitPreferencesForApi() {
    // First, try to use the user's saved unit preferences
    if (this.unitPreferences && this.unitPreferences.unitMappings && 
        Array.isArray(this.unitPreferences.unitMappings) && 
        this.unitPreferences.unitMappings.length > 0) {
      console.log('Using saved unit preferences:', this.unitPreferences);
      return this.unitPreferences;
    }
    
    // If the saved preferences aren't in the correct format, convert them
    if (this.unitPreferences && typeof this.unitPreferences === 'object' && 
        Object.keys(this.unitPreferences).length > 0) {
      console.log('Converting unit preferences format:', this.unitPreferences);
      
      const unitMappings = Object.entries(this.unitPreferences).map(([unitTypeClassName, unitName]) => ({
        unitTypeClassName,
        unitName
      }));
      
      return {
        unitMappings
      };
    }
    
    // Fall back to default preferences if no saved preferences exist
    const defaultPreferences = configService.getDefaultUnitPreferences();
    console.log('Using default unit preferences:', defaultPreferences);
    
    if (defaultPreferences && defaultPreferences.unitMappings && 
        Array.isArray(defaultPreferences.unitMappings) && 
        defaultPreferences.unitMappings.length > 0) {
      return defaultPreferences;
    }
    
    // Last resort: create a default structure based on the OpenAPI spec
    return {
      unitMappings: [
        { unitTypeClassName: "Range", unitName: "YARDS" },
        { unitTypeClassName: "ScopeAdjustment", unitName: "MOA" },
        { unitTypeClassName: "Temperature", unitName: "FAHRENHEIT" },
        { unitTypeClassName: "BulletVelocity", unitName: "FEET_PER_SECOND" },
        { unitTypeClassName: "WindSpeed", unitName: "MILES_PER_HOUR" },
        { unitTypeClassName: "WindDirection", unitName: "CLOCK" },
        { unitTypeClassName: "AtmosphericPressure", unitName: "INCHES_MERCURY" },
        { unitTypeClassName: "BulletWeight", unitName: "GRAINS" },
        { unitTypeClassName: "BulletEnergy", unitName: "FOOT_POUNDS" },
        { unitTypeClassName: "TimeOfFlight", unitName: "SECONDS" }
      ]
    };
  }

  async computeBallisticSolution(config) {
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

  async getSystemInfo() {
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
