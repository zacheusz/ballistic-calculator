declare module '../services/api' {
  import { UnitPreferences } from '../types/ballistics';
  
  const api: {
    setUnitPreferences: (preferences: UnitPreferences) => void;
    // Add other methods as needed
  };
  
  export default api;
}
