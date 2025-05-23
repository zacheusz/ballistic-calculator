import axios from 'axios';
import configService from './configService';

class BallisticsApi {
  constructor() {
    this.apiKey = localStorage.getItem('snipe_ballistics_api_key') || '';
    this.environment = localStorage.getItem('snipe_ballistics_api_environment') || 'dev';
    this.unitPreferences = JSON.parse(localStorage.getItem('snipe_ballistics_unit_preferences')) || this.getDefaultUnitPreferences();
    this.updateClient();
  }
  
  getDefaultUnitPreferences() {
    return configService.getDefaultUnitPreferences();
  }
  
  updateClient() {
    const BASE_URL = `https://api.calculator.snipe.technology/${this.environment}`;
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
    // Format unit preferences for API request
    const unitMappings = Object.entries(this.unitPreferences).map(([unitTypeClassName, unitName]) => ({
      unitTypeClassName,
      unitName
    }));
    
    return {
      unitMappings
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
