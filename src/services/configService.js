import defaultConfig from '../config/default.json';

/**
 * Configuration service for managing application defaults
 * Loads configuration from default.json and provides access to default values
 */
class ConfigService {
  constructor() {
    this.config = defaultConfig;
  }

  /**
   * Get the default firearm profile
   * @returns {Object} The default firearm profile
   */
  getDefaultFirearmProfile() {
    return { ...this.config.firearmProfile };
  }

  /**
   * Get the default ammunition settings
   * @returns {Object} The default ammunition settings
   */
  getDefaultAmmo() {
    return { ...this.config.ammo };
  }

  /**
   * Get the default atmosphere settings
   * @returns {Object} The default atmosphere settings
   */
  getDefaultAtmosphere() {
    return { ...this.config.atmosphere };
  }

  /**
   * Get the default shot settings
   * @returns {Object} The default shot settings
   */
  getDefaultShot() {
    return { ...this.config.shot };
  }

  /**
   * Get the default calculation options
   * @returns {Object} The default calculation options
   */
  getDefaultCalculationOptions() {
    return { ...this.config.calculationOptions };
  }

  /**
   * Get the default unit preferences
   * @returns {Object} The default unit preferences
   */
  getDefaultUnitPreferences() {
    return { ...this.config.unitPreferences };
  }

  /**
   * Get the entire configuration
   * @returns {Object} The entire configuration object
   */
  getConfig() {
    return { ...this.config };
  }
}

export default new ConfigService();
