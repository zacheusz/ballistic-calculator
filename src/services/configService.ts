import defaultConfig from '../config/default.json';
import { FirearmProfile, Ammo, Atmosphere, Shot, UnitPreferences, Preferences } from '../types/ballistics';

// Using Preferences from ballistics.ts instead of defining it here

interface Config {
  firearmProfile: FirearmProfile;
  ammo: Ammo;
  atmosphere: Atmosphere;
  shot: Shot;
  preferences: Preferences;
}

/**
 * Configuration service for managing application defaults
 * Loads configuration from default.json and provides access to default values
 */
class ConfigService {
  config: Config;

  constructor() {
    this.config = defaultConfig as Config;
  }

  /**
   * Get the default firearm profile
   * @returns {FirearmProfile} The default firearm profile
   */
  getDefaultFirearmProfile(): FirearmProfile {
    return { ...this.config.firearmProfile };
  }

  /**
   * Get the default ammunition settings
   * @returns {Ammo} The default ammunition settings
   */
  getDefaultAmmo(): Ammo {
    return { ...this.config.ammo };
  }

  /**
   * Get the default atmosphere settings
   * @returns {Atmosphere} The default atmosphere settings
   */
  getDefaultAtmosphere(): Atmosphere {
    return { ...this.config.atmosphere };
  }

  /**
   * Get the default shot settings
   * @returns {Shot} The default shot settings
   */
  getDefaultShot(): Shot {
    return { ...this.config.shot };
  }

  /**
   * Get the default calculation options
   * @returns {Preferences} The default calculation options
   */
  getDefaultCalculationOptions(): Preferences {
    const preferences: Preferences = { ...this.config.preferences };
    
    console.log('ConfigService: Full default preferences:', preferences);
    return preferences;
  }

  /**
   * Get the default unit preferences
   * @returns {UnitPreferences} The default unit preferences
   */
  getDefaultUnitPreferences(): UnitPreferences {
    return { ...this.config.preferences.unitPreferences };
  }

  /**
   * Get the entire configuration
   * @returns {Config} The entire configuration object
   */
  getConfig(): Config {
    return { ...this.config };
  }
}

export default new ConfigService();
