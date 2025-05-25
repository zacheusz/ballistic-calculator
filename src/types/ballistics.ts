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
  | 'GRAINS'
  | 'GRAMS'
  | 'INCHES_MERCURY'
  | 'HECTOPASCALS'
  | 'FOOT_POUNDS'
  | 'JOULES'
  | 'SECONDS'
  | 'MILLISECONDS';

export interface Measurement<T = number> {
  value: T;
  unit: Unit;
}

export interface FirearmProfile {
  id: number;
  name: string;
  sightHeight: Measurement;
  sightOffset: Measurement;
  barrelTwist: Measurement;
  barrelTwistDirection: 'RIGHT' | 'LEFT';
  elevAdjUnit: Unit;
  windAdjUnit: Unit;
  leadAdjUnit: Unit;
  sightReticle: string;
  reticleFfp: boolean;
  sightLowMagnification: number;
  sightHighMagnification: number;
  sightTrueMagnification: number;
  elevTurretGrad: number;
  windTurretGrad: number;
  correctionFactorElev: number;
  correctionFactorWind: number;
  ammoProfiles: unknown[];
}

export interface Ammo {
  bulletManufacturer: string;
  bulletModel: string;
  dragModel: 'G1' | 'G7' | 'CDM';
  diameter: Measurement;
  mass: Measurement;
  length: Measurement;
  muzzleVelocity: Measurement;
  muzzleVelVarDeg: number;
  zeroRange: Measurement;
  ballisticCoefficients?: Array<{
    value: number;
    minVelocity?: number;
    dragModel?: 'G1' | 'G7' | 'CDM';
  }>;
}

export interface Atmosphere {
  temperature: Measurement;
  pressure: Measurement;
  pressureType: 'STATION' | 'ABSOLUTE';
  humidity: number;
  altitude: Measurement;
  standardName?: string;
  densityAltitude?: Measurement;
}

export interface WindSegment {
  maxRange: Measurement;
  speed: Measurement;
  direction: Measurement;
  verticalComponent: Measurement;
}

export interface Shot {
  range: Measurement;
  elevationAngle: Measurement;
  powderTemp: Measurement;
  targetSpeed: Measurement;
  targetAngle: Measurement;
  azimuth: Measurement;
  latitude: Measurement;
  windSegments: WindSegment[];
}

export interface UnitPreference {
  unitTypeClassName: string;
  unitName: Unit;
}

export interface UnitPreferences {
  unitMappings: UnitPreference[];
}

export interface Preferences {
  calculateSpinDrift: boolean;
  calculateCoriolisEffect: boolean;
  calculateAeroJump: boolean;
  rangeCardStart: Measurement;
  rangeCardStep: Measurement;
  unitPreferences: UnitPreferences;
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
