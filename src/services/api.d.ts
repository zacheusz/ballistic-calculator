import { UnitPreferences } from '../types/ballistics';

interface BallisticsApi {
  setApiKey: (apiKey: string) => void;
  getApiKey: () => string;
  setEnvironment: (environment: string) => void;
  getEnvironment: () => string;
  setUnitPreferences: (preferences: UnitPreferences) => void;
  getUnitPreferences: () => UnitPreferences;
  getUnitPreferencesForApi: () => any;
  computeBallisticSolution: (config: any) => Promise<any>;
  getSystemInfo: () => Promise<any>;
}

declare const api: BallisticsApi;
export default api;
