import defaultConfig from '../config/default.json';
import { FirearmProfile, Ammo, Atmosphere, Shot, UnitPreferences, Measurement } from '../types/ballistics';

interface Preferences {
  calculateSpinDrift: boolean;
  calculateCoriolisEffect: boolean;
  calculateAeroJump: boolean;
  rangeCardStart: Measurement;
  rangeCardStep: Measurement;
  unitPreferences: UnitPreferences;
}

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
   * @returns {Object} The default calculation options
   */
  getDefaultCalculationOptions(): {
    calculateSpinDrift: boolean;
    calculateCoriolisEffect: boolean;
    calculateAeroJump: boolean;
  } {
    return { 
      calculateSpinDrift: this.config.preferences.calculateSpinDrift,
      calculateCoriolisEffect: this.config.preferences.calculateCoriolisEffect,
      calculateAeroJump: this.config.preferences.calculateAeroJump
    };
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
