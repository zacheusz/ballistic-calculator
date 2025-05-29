/**
 * All possible measurement units supported by the API
 */
export type Unit =
  | 'YARDS'
  | 'METERS'
  | 'FEET'
  | 'INCHES'
  | 'CENTIMETERS'
  | 'MILLIMETERS'
  | 'MILES_PER_HOUR'
  | 'KILOMETERS_PER_HOUR'
  | 'METERS_PER_SECOND'
  | 'FEET_PER_SECOND'
  | 'DEGREES'
  | 'CLOCK'
  | 'MILS'
  | 'MOA'
  | 'IPHY'
  | 'FAHRENHEIT'
  | 'CELSIUS'
  | 'RANKINE'
  | 'KELVIN'
  | 'GRAINS'
  | 'GRAMS'
  | 'INCHES_MERCURY'
  | 'HECTOPASCALS'
  | 'FOOT_POUNDS'
  | 'JOULES'
  | 'SECONDS'
  | 'MILLISECONDS';

/**
 * Unit types as defined in the API spec
 * These are provided for documentation and future type checking
 * but are not currently enforced in the codebase
 */

/**
 * Range unit types as defined in the API spec
 * @remarks Valid values: 'YARDS', 'METERS', 'FEET'
 */
export type RangeUnit = Unit;

/**
 * Gun parameter unit types as defined in the API spec
 * @remarks Valid values: 'INCHES', 'CENTIMETERS', 'MILLIMETERS'
 */
export type GunParameterUnit = Unit;

/**
 * Wind speed unit types as defined in the API spec
 * @remarks Valid values: 'MILES_PER_HOUR', 'KILOMETERS_PER_HOUR', 'METERS_PER_SECOND'
 */
export type WindSpeedUnit = Unit;

/**
 * Bullet velocity unit types as defined in the API spec
 * @remarks Valid values: 'FEET_PER_SECOND', 'METERS_PER_SECOND'
 */
export type BulletVelocityUnit = Unit;

/**
 * Wind direction unit types as defined in the API spec
 * @remarks Valid values: 'DEGREES', 'CLOCK'
 */
export type WindDirectionUnit = Unit;

/**
 * Angle unit types as defined in the API spec
 * @remarks Valid values: 'DEGREES'
 */
export type AngleUnit = Unit;

/**
 * Scope adjustment unit types as defined in the API spec
 * @remarks Valid values: 'MILS', 'MOA', 'IPHY', 'DEGREES'
 */
export type ScopeAdjustmentUnit = Unit;

/**
 * Temperature unit types as defined in the API spec
 * @remarks Valid values: 'FAHRENHEIT', 'CELSIUS', 'RANKINE'
 */
export type TemperatureUnit = Unit;

/**
 * Bullet weight unit types as defined in the API spec
 * @remarks Valid values: 'GRAINS', 'GRAMS'
 */
export type BulletWeightUnit = Unit;

/**
 * Atmospheric pressure unit types as defined in the API spec
 * @remarks Valid values: 'INCHES_MERCURY', 'HECTOPASCALS'
 */
export type AtmosphericPressureUnit = Unit;

/**
 * Bullet energy unit types as defined in the API spec
 * @remarks Valid values: 'FOOT_POUNDS', 'JOULES'
 */
export type BulletEnergyUnit = Unit;

/**
 * Time of flight unit types as defined in the API spec
 * @remarks Valid values: 'SECONDS', 'MILLISECONDS'
 */
export type TimeOfFlightUnit = Unit;

/**
 * Generic measurement interface with value and unit
 * 
 * @remarks
 * This interface represents a measurement value with its associated unit.
 * For numeric measurements, certain properties (like bullet diameter, mass, length,
 * muzzle velocity) must have positive non-zero values as per the API spec.
 * 
 * @template T - Type of the measurement value, defaults to number
 */
export interface Measurement<T = number> {
  /** 
   * The numeric value of the measurement
   * @remarks Some measurements require positive non-zero values
   */
  value: T;
  
  /**
   * The unit of measurement
   * @remarks Must be one of the valid units defined in the Unit type
   */
  unit: Unit;
}

/**
 * The following interfaces are specialized measurement types that match the OpenAPI spec.
 * 
 * IMPORTANT: These are currently defined as aliases to the generic Measurement type for backward compatibility.
 * In future development, these could be enhanced to enforce stricter type checking.
 * 
 * @remarks
 * According to the OpenAPI spec, these specialized measurement types should use specific unit types.
 * The JSDoc comments document the intended unit types for each measurement.
 */

/**
 * Range measurement interface
 * @remarks Matches the RangeMeasurement schema in the OpenAPI spec
 * @remarks Should use RangeUnit ('YARDS', 'METERS', 'FEET')
 */
export type RangeMeasurement = Measurement;

/**
 * Altitude measurement interface
 * @remarks Matches the AltitudeMeasurement schema in the OpenAPI spec
 * @remarks Should use 'FEET' or 'METERS'
 */
export type AltitudeMeasurement = Measurement;

/**
 * Gun parameters measurement interface
 * @remarks Matches the GunParametersMeasurement schema in the OpenAPI spec
 * @remarks Should use GunParameterUnit ('INCHES', 'CENTIMETERS', 'MILLIMETERS')
 * @remarks Value must be positive and non-zero
 */
export type GunParametersMeasurement = Measurement;

/**
 * Wind speed measurement interface
 * @remarks Matches the WindSpeedMeasurement schema in the OpenAPI spec
 * @remarks Should use WindSpeedUnit ('MILES_PER_HOUR', 'KILOMETERS_PER_HOUR', 'METERS_PER_SECOND')
 */
export type WindSpeedMeasurement = Measurement;

/**
 * Target speed measurement interface
 * @remarks Matches the TargetSpeedMeasurement schema in the OpenAPI spec
 * @remarks Should use WindSpeedUnit ('MILES_PER_HOUR', 'KILOMETERS_PER_HOUR', 'METERS_PER_SECOND')
 */
export type TargetSpeedMeasurement = Measurement;

/**
 * Bullet velocity measurement interface
 * @remarks Matches the BulletVelocityMeasurement schema in the OpenAPI spec
 * @remarks Should use BulletVelocityUnit ('FEET_PER_SECOND', 'METERS_PER_SECOND')
 * @remarks Value must be positive and non-zero
 */
export type BulletVelocityMeasurement = Measurement;

/**
 * Wind direction measurement interface
 * @remarks Matches the WindDirectionMeasurement schema in the OpenAPI spec
 * @remarks Should use WindDirectionUnit ('DEGREES', 'CLOCK')
 */
export type WindDirectionMeasurement = Measurement;

/**
 * Angle measurement interface
 * @remarks Matches the AngleMeasurement schema in the OpenAPI spec
 * @remarks Should use AngleUnit ('DEGREES')
 */
export type AngleMeasurement = Measurement;

/**
 * Scope adjustment measurement interface
 * @remarks Matches the ScopeAdjustmentMeasurement schema in the OpenAPI spec
 * @remarks Should use ScopeAdjustmentUnit ('MILS', 'MOA', 'IPHY', 'DEGREES')
 */
export type ScopeAdjustmentMeasurement = Measurement;

/**
 * Temperature measurement interface
 * @remarks Matches the TemperatureMeasurement schema in the OpenAPI spec
 * @remarks Should use TemperatureUnit ('FAHRENHEIT', 'CELSIUS', 'RANKINE')
 */
export type TemperatureMeasurement = Measurement;

/**
 * Bullet weight measurement interface
 * @remarks Matches the BulletWeightMeasurement schema in the OpenAPI spec
 * @remarks Should use BulletWeightUnit ('GRAINS', 'GRAMS')
 * @remarks Value must be positive and non-zero
 */
export type BulletWeightMeasurement = Measurement;

/**
 * Atmospheric pressure measurement interface
 * @remarks Matches the AtmosphericPressureMeasurement schema in the OpenAPI spec
 * @remarks Should use AtmosphericPressureUnit ('INCHES_MERCURY', 'HECTOPASCALS')
 */
export type AtmosphericPressureMeasurement = Measurement;

/**
 * Bullet energy measurement interface
 * @remarks Matches the BulletEnergyMeasurement schema in the OpenAPI spec
 * @remarks Should use BulletEnergyUnit ('FOOT_POUNDS', 'JOULES')
 */
export type BulletEnergyMeasurement = Measurement;

/**
 * Time of flight measurement interface
 * @remarks Matches the TimeOfFlightMeasurement schema in the OpenAPI spec
 * @remarks Should use TimeOfFlightUnit ('SECONDS', 'MILLISECONDS')
 */
export type TimeOfFlightMeasurement = Measurement;

/**
 * Firearm configuration with sight and barrel properties
 * @remarks Matches the FirearmProfile schema in the OpenAPI spec
 */
export interface FirearmProfile {
  /** Firearm profile ID */
  id: number;
  /** Firearm name */
  name: string;
  /** Height of the sight above the barrel axis */
  sightHeight: GunParametersMeasurement;
  /** Horizontal offset of the sight from barrel center */
  sightOffset: GunParametersMeasurement;
  /** Barrel twist rate */
  barrelTwist: GunParametersMeasurement;
  /** Direction of barrel twist */
  barrelTwistDirection: 'RIGHT' | 'LEFT';
  /** Unit for elevation adjustment */
  elevAdjUnit: ScopeAdjustmentUnit;
  /** Unit for windage adjustment */
  windAdjUnit: ScopeAdjustmentUnit;
  /** Unit for lead adjustment */
  leadAdjUnit: ScopeAdjustmentUnit;
  /** Reticle type */
  sightReticle: string;
  /** Whether reticle is on first focal plane */
  reticleFfp: boolean;
  /** Lowest magnification setting */
  sightLowMagnification: number;
  /** Highest magnification setting */
  sightHighMagnification: number;
  /** True magnification */
  sightTrueMagnification: number;
  /** Elevation turret graduation */
  elevTurretGrad: number;
  /** Windage turret graduation */
  windTurretGrad: number;
  /** Correction factor for elevation */
  correctionFactorElev: number;
  /** Correction factor for windage */
  correctionFactorWind: number;
  /** Associated ammunition profiles */
  ammoProfiles: unknown[];
}

/**
 * Ammunition configuration including physical properties and drag model
 * @remarks Matches the Ammo schema in the OpenAPI spec
 */
export interface Ammo {
  /** Manufacturer of the bullet component */
  bulletManufacturer: string;
  /** Specific bullet model or design */
  bulletModel: string;
  /** Drag model used for the bullet */
  dragModel: 'G1' | 'G7' | 'CDM';
  /** Bullet diameter (must be nonzero) */
  diameter: GunParametersMeasurement;
  /** Bullet weight or mass (must be nonzero) */
  mass: BulletWeightMeasurement;
  /** Bullet length (must be nonzero) */
  length: GunParametersMeasurement;
  /** Bullet velocity at muzzle (must be nonzero) */
  muzzleVelocity: BulletVelocityMeasurement;
  /** Muzzle velocity variation in degrees */
  muzzleVelVarDeg: number;
  /** Zero range of the ammo */
  zeroRange: RangeMeasurement;
  /** Ballistic coefficients for the bullet (required for G1 and G7, not required for CDM) */
  ballisticCoefficients?: Array<{
    /** Ballistic coefficient value */
    value: number;
    /** Minimum velocity for this coefficient */
    minVelocity?: number;
    /** Drag model for this coefficient */
    dragModel?: 'G1' | 'G7' | 'CDM';
  }>;
}

/**
 * Atmospheric conditions specification for ballistic calculations
 * @remarks Matches the Atmosphere schema in the OpenAPI spec
 */
export interface Atmosphere {
  /** Ambient temperature */
  temperature: TemperatureMeasurement;
  /** Atmospheric pressure */
  pressure: AtmosphericPressureMeasurement;
  /** Type of pressure measurement */
  pressureType: 'STATION' | 'ABSOLUTE';
  /** Relative humidity (0-100%) */
  humidity: number;
  /** Altitude above sea level */
  altitude: AltitudeMeasurement;
  /** Name of the atmospheric standard */
  standardName?: string;
  /** Density altitude */
  densityAltitude?: AltitudeMeasurement;
}

/**
 * Wind segment for a specific range
 * @remarks Matches the wind segment object in the Shot schema in the OpenAPI spec
 */
export interface WindSegment {
  /** Maximum range for this wind segment */
  maxRange: RangeMeasurement;
  /** Wind speed */
  speed: WindSpeedMeasurement;
  /** Wind direction */
  direction: WindDirectionMeasurement;
  /** Vertical component of the wind */
  verticalComponent: WindSpeedMeasurement;
}

/**
 * Shot scenario parameters including target information and wind conditions
 * @remarks Matches the Shot schema in the OpenAPI spec
 */
export interface Shot {
  /** Distance to target */
  range: RangeMeasurement;
  /** Elevation angle in degrees (uphill/downhill) */
  elevationAngle: AngleMeasurement;
  /** Temperature of the powder */
  powderTemp: TemperatureMeasurement;
  /** Speed of moving target */
  targetSpeed: TargetSpeedMeasurement;
  /** Direction of target movement in degrees */
  targetAngle: AngleMeasurement;
  /** Shooting azimuth in degrees (0-360) */
  azimuth: AngleMeasurement;
  /** Shooting latitude in degrees */
  latitude: AngleMeasurement;
  /** Wind segments for different ranges */
  windSegments: WindSegment[];
}

export interface UnitPreference {
  unitTypeClassName: string;
  unitName: Unit;
}

export interface UnitPreferences {
  unitMappings: UnitPreference[];
}

/**
 * User preferences for the calculator: range card settings, feature flags and unit preferences
 * @remarks Matches the Preferences schema in the OpenAPI spec
 */
export interface Preferences {
  /** Calculate spin drift effects */
  calculateSpinDrift: boolean;
  /** Calculate Coriolis effects */
  calculateCoriolisEffect: boolean;
  /** Calculate aerodynamic jump */
  calculateAeroJump: boolean;
  /** Starting range for range card */
  rangeCardStart: RangeMeasurement;
  /** Step size for range card (0 for HUD mode/single solution) */
  rangeCardStep: RangeMeasurement;
  /** Unit preferences for display and calculations */
  unitPreferences: UnitPreferences;
  /** Interpolate solutions for exact shot range */
  interpolateRange?: boolean;
}

export interface BallisticsRequest {
  firearmProfile: FirearmProfile;
  ammo: Ammo;
  atmosphere: Atmosphere;
  shot: Shot;
  preferences: Preferences;
  zeroAtmosphere?: Atmosphere;
}

/**
 * Utility functions for unit validation
 * 
 * @remarks
 * These functions help validate that units are used correctly at runtime,
 * even though the type system is kept flexible for backward compatibility.
 */

/**
 * Validates if a unit is a valid range unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid range unit
 */
export function isValidRangeUnit(unit: Unit): boolean {
  return unit === 'YARDS' || unit === 'METERS' || unit === 'FEET';
}

/**
 * Validates if a unit is a valid altitude unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid altitude unit
 */
export function isValidAltitudeUnit(unit: Unit): boolean {
  return unit === 'METERS' || unit === 'FEET';
}

/**
 * Validates if a unit is a valid gun parameter unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid gun parameter unit
 */
export function isValidGunParameterUnit(unit: Unit): boolean {
  return unit === 'INCHES' || unit === 'CENTIMETERS' || unit === 'MILLIMETERS';
}

/**
 * Validates if a unit is a valid wind speed unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid wind speed unit
 */
export function isValidWindSpeedUnit(unit: Unit): boolean {
  return unit === 'MILES_PER_HOUR' || unit === 'KILOMETERS_PER_HOUR' || unit === 'METERS_PER_SECOND';
}

/**
 * Validates if a unit is a valid bullet velocity unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid bullet velocity unit
 */
export function isValidBulletVelocityUnit(unit: Unit): boolean {
  return unit === 'FEET_PER_SECOND' || unit === 'METERS_PER_SECOND';
}

/**
 * Validates if a unit is a valid wind direction unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid wind direction unit
 */
export function isValidWindDirectionUnit(unit: Unit): boolean {
  return unit === 'DEGREES' || unit === 'CLOCK';
}

/**
 * Validates if a unit is a valid angle unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid angle unit
 */
export function isValidAngleUnit(unit: Unit): boolean {
  return unit === 'DEGREES';
}

/**
 * Validates if a unit is a valid scope adjustment unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid scope adjustment unit
 */
export function isValidScopeAdjustmentUnit(unit: Unit): boolean {
  return unit === 'MILS' || unit === 'MOA' || unit === 'IPHY' || unit === 'DEGREES';
}

/**
 * Validates if a unit is a valid temperature unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid temperature unit
 */
export function isValidTemperatureUnit(unit: Unit): boolean {
  return unit === 'FAHRENHEIT' || unit === 'CELSIUS' || unit === 'RANKINE';
}

/**
 * Validates if a unit is a valid bullet weight unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid bullet weight unit
 */
export function isValidBulletWeightUnit(unit: Unit): boolean {
  return unit === 'GRAINS' || unit === 'GRAMS';
}

/**
 * Validates if a unit is a valid atmospheric pressure unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid atmospheric pressure unit
 */
export function isValidAtmosphericPressureUnit(unit: Unit): boolean {
  return unit === 'INCHES_MERCURY' || unit === 'HECTOPASCALS';
}

/**
 * Validates if a unit is a valid bullet energy unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid bullet energy unit
 */
export function isValidBulletEnergyUnit(unit: Unit): boolean {
  return unit === 'FOOT_POUNDS' || unit === 'JOULES';
}

/**
 * Validates if a unit is a valid time of flight unit
 * @param unit The unit to validate
 * @returns True if the unit is a valid time of flight unit
 */
export function isValidTimeOfFlightUnit(unit: Unit): boolean {
  return unit === 'SECONDS' || unit === 'MILLISECONDS';
}

export interface BallisticsState {
  firearmProfile: FirearmProfile;
  ammo: Ammo;
  atmosphere: Atmosphere;
  shot: Shot;
  preferences: Preferences;
  zeroAtmosphere?: Atmosphere;
  updateFirearmProfile: (updates: Partial<FirearmProfile>) => void;
  updateAmmo: (updates: Partial<Ammo>) => void;
  updateAtmosphere: (updates: Partial<Atmosphere>) => void;
  updateShot: (updates: Partial<Shot>) => void;
  updatePreferences: (updates: Partial<Preferences>) => void;
  updateWindSegment: (index: number, updates: Partial<WindSegment>) => void;
  resetToDefault: () => void;
  toApiRequest: () => BallisticsRequest;
}
