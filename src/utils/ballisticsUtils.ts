import { BallisticsRequest, FirearmProfile, Ammo, Atmosphere, Shot, Preferences } from '@/types/ballistics';
import defaultConfig from '@/config/default.json';

// Helper function to create a measurement object
export const createMeasurement = (value: number, unit: string) => ({
  value,
  unit,
});

// Default values based on the default.json
export const defaultFirearmProfile: FirearmProfile = {
  id: 0,
  name: 'Bor_308',
  sightHeight: createMeasurement(3.19, 'INCHES'),
  sightOffset: createMeasurement(0.0, 'INCHES'),
  barrelTwist: createMeasurement(12.0, 'INCHES'),
  barrelTwistDirection: 'RIGHT',
  elevAdjUnit: 'MOA',
  windAdjUnit: 'MOA',
  leadAdjUnit: 'MOA',
  sightReticle: '',
  reticleFfp: false,
  sightLowMagnification: 0.0,
  sightHighMagnification: 0.0,
  sightTrueMagnification: 0.0,
  elevTurretGrad: 0.25,
  windTurretGrad: 0.25,
  correctionFactorElev: 1.0,
  correctionFactorWind: 1.0,
  ammoProfiles: [],
};

export const defaultAmmo: Ammo = {
  bulletManufacturer: 'Lapua',
  bulletModel: 'Scenar',
  dragModel: 'CDM',
  diameter: createMeasurement(0.308, 'INCHES'),
  mass: createMeasurement(185.0, 'GRAINS'),
  length: createMeasurement(1.30, 'INCHES'),
  muzzleVelocity: createMeasurement(2510, 'FEET_PER_SECOND'),
  muzzleVelVarDeg: 0.0,
  zeroRange: createMeasurement(100, 'YARDS'),
};

export const defaultAtmosphere: Atmosphere = {
  temperature: createMeasurement(70.0, 'FAHRENHEIT'),
  pressure: createMeasurement(30.0, 'INCHES_MERCURY'),
  pressureType: 'STATION',
  humidity: 50.0,
  altitude: createMeasurement(0.0, 'FEET'),
};

export const defaultShot: Shot = {
  range: createMeasurement(1500, 'YARDS'),
  elevationAngle: createMeasurement(0.0, 'DEGREES'),
  powderTemp: createMeasurement(70.0, 'FAHRENHEIT'),
  targetSpeed: createMeasurement(0.0, 'MILES_PER_HOUR'),
  targetAngle: createMeasurement(0.0, 'DEGREES'),
  azimuth: createMeasurement(0, 'DEGREES'),
  latitude: createMeasurement(0, 'DEGREES'),
  windSegments: [
    {
      maxRange: createMeasurement(1500, 'YARDS'),
      speed: createMeasurement(6.0, 'MILES_PER_HOUR'),
      direction: createMeasurement(3, 'CLOCK'),
      verticalComponent: createMeasurement(0.0, 'MILES_PER_HOUR'),
    },
  ],
};

export const defaultPreferences: Preferences = {
  calculateSpinDrift: true,
  calculateCoriolisEffect: true,
  calculateAeroJump: false,
  rangeCardStart: createMeasurement(100, 'YARDS'),
  rangeCardStep: createMeasurement(100, 'YARDS'),
  unitPreferences: {
    unitMappings: [
      { unitTypeClassName: 'Range', unitName: 'YARDS' },
      { unitTypeClassName: 'ScopeAdjustment', unitName: 'MOA' },
      { unitTypeClassName: 'Temperature', unitName: 'FAHRENHEIT' },
      { unitTypeClassName: 'BulletVelocity', unitName: 'FEET_PER_SECOND' },
      { unitTypeClassName: 'WindSpeed', unitName: 'MILES_PER_HOUR' },
      { unitTypeClassName: 'WindDirection', unitName: 'CLOCK' },
      { unitTypeClassName: 'AtmosphericPressure', unitName: 'INCHES_MERCURY' },
      { unitTypeClassName: 'BulletWeight', unitName: 'GRAINS' },
      { unitTypeClassName: 'BulletEnergy', unitName: 'FOOT_POUNDS' },
      { unitTypeClassName: 'TimeOfFlight', unitName: 'SECONDS' },
    ],
  },
};

// Function to create a deep clone of an object
const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

// Function to load default configuration
export const getDefaultConfig = (): BallisticsRequest => {
  // Use values from default.json as the primary source
  // Fall back to hardcoded defaults if needed
  return {
    firearmProfile: deepClone({
      ...defaultFirearmProfile,
      ...(defaultConfig.firearmProfile || {})
    }),
    ammo: deepClone({
      ...defaultAmmo,
      ...(defaultConfig.ammo || {})
    }),
    atmosphere: deepClone({
      ...defaultAtmosphere,
      ...(defaultConfig.atmosphere || {})
    }),
    shot: deepClone({
      ...defaultShot,
      ...(defaultConfig.shot || {})
    }),
    preferences: deepClone({
      ...defaultPreferences,
      ...(defaultConfig.preferences || {})
    }),
  };
};

// Function to merge updates with default values
export const mergeWithDefaults = <T extends object>(
  defaults: T,
  updates: Partial<T> = {}
): T => {
  const result = deepClone(defaults);
  
  // Handle nested objects
  Object.keys(updates).forEach((key) => {
    const k = key as keyof T;
    const value = updates[k];
    
    if (value !== undefined && value !== null) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        // @ts-ignore - TypeScript can't infer the type here
        result[k] = mergeWithDefaults(result[k] || {}, value);
      } else {
        // @ts-ignore - TypeScript can't infer the type here
        result[k] = value;
      }
    }
  });
  
  return result;
};

// Function to convert the store state to the API request format
export const toApiRequest = (state: {
  firearmProfile: FirearmProfile;
  ammo: Ammo;
  atmosphere: Atmosphere;
  shot: Shot;
  preferences: Preferences;
  zeroAtmosphere?: Atmosphere;
}): BallisticsRequest => {
  const request: BallisticsRequest = {
    firearmProfile: deepClone(state.firearmProfile),
    ammo: deepClone(state.ammo),
    atmosphere: deepClone(state.atmosphere),
    shot: deepClone(state.shot),
    preferences: deepClone(state.preferences),
  };

  if (state.zeroAtmosphere) {
    request.zeroAtmosphere = deepClone(state.zeroAtmosphere);
  }

  return request;
};
