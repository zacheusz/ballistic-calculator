import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Measurement, Unit } from '../types/ballistics';

export interface FirearmProfile {
  sightHeight: Measurement;
  twistRate: Measurement;
  twistDirection: 'RIGHT' | 'LEFT';
  barrelLength: Measurement;
  zeroDistance: Measurement;
  barrelTwist: Measurement;
}

export interface Ammunition {
  bulletWeight: Measurement;
  bulletDiameter: Measurement;
  ballisticCoefficient: number; // This is unitless
  muzzleVelocity: Measurement;
  bulletLength: Measurement;
  bulletStyle: 'flat' | 'boat-tail' | 'hollow-point' | 'spitzer' | 'round-nose';
  dragModel?: 'G1' | 'G7' | 'CDM';
}

export interface Atmosphere {
  temperature: Measurement;
  pressure: Measurement;
  humidity: number; // Percentage, unitless
  altitude: Measurement;
  pressureType?: 'STATION' | 'ABSOLUTE';
}

export interface ShotParameters {
  distance: Measurement;
  angle: Measurement;
  targetSize: Measurement;
  windSpeed: Measurement;
  windAngle: Measurement;
  cantAngle: Measurement;
  azimuth?: Measurement;
  latitude?: Measurement;
  windSegments?: Array<{
    maxRange: Measurement;
    speed: Measurement;
    direction: Measurement;
    verticalComponent?: Measurement;
  }>;
}

export interface BallisticsRequestState {
  // Firearm Profile
  firearm: FirearmProfile;
  setFirearm: (firearm: Partial<FirearmProfile>) => void;
  
  // Ammunition
  ammo: Ammunition;
  setAmmo: (ammo: Partial<Ammunition>) => void;
  
  // Atmosphere
  atmosphere: Atmosphere;
  setAtmosphere: (atmosphere: Partial<Atmosphere>) => void;
  
  // Shot Parameters
  shot: ShotParameters;
  setShot: (shot: Partial<ShotParameters>) => void;
  
  // Reset to default values
  reset: () => void;
}

const initialState = {
  firearm: {
    sightHeight: { value: 2.5, unit: 'INCHES' as Unit },
    twistRate: { value: 10, unit: 'INCHES' as Unit }, // 1:X inches
    twistDirection: 'RIGHT' as const,
    barrelLength: { value: 24, unit: 'INCHES' as Unit },
    zeroDistance: { value: 100, unit: 'YARDS' as Unit },
    barrelTwist: { value: 9, unit: 'INCHES' as Unit } // inches per turn
  },
  ammo: {
    bulletWeight: { value: 168, unit: 'GRAINS' as Unit },
    bulletDiameter: { value: 0.308, unit: 'INCHES' as Unit },
    ballisticCoefficient: 0.45, // unitless
    muzzleVelocity: { value: 2600, unit: 'FEET_PER_SECOND' as Unit },
    bulletLength: { value: 1.2, unit: 'INCHES' as Unit },
    bulletStyle: 'boat-tail' as const,
    dragModel: 'G1' as const
  },
  atmosphere: {
    temperature: { value: 59, unit: 'FAHRENHEIT' as Unit },
    pressure: { value: 29.92, unit: 'INCHES_MERCURY' as Unit },
    humidity: 50, // % (unitless)
    altitude: { value: 0, unit: 'FEET' as Unit },
    pressureType: 'STATION' as const
  },
  shot: {
    distance: { value: 500, unit: 'YARDS' as Unit },
    angle: { value: 0, unit: 'DEGREES' as Unit },
    targetSize: { value: 12, unit: 'INCHES' as Unit },
    windSpeed: { value: 5, unit: 'MILES_PER_HOUR' as Unit },
    windAngle: { value: 90, unit: 'DEGREES' as Unit }, // (0-359, 0 = headwind, 90 = right to left, 180 = tailwind, 270 = left to right)
    cantAngle: { value: 0, unit: 'DEGREES' as Unit },
    azimuth: { value: 0, unit: 'DEGREES' as Unit },
    latitude: { value: 0, unit: 'DEGREES' as Unit },
    windSegments: [
      {
        maxRange: { value: 1000, unit: 'YARDS' as Unit },
        speed: { value: 5, unit: 'MILES_PER_HOUR' as Unit },
        direction: { value: 90, unit: 'DEGREES' as Unit },
        verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' as Unit }
      }
    ]
  }
};

export const useBallisticsRequestStore = create<BallisticsRequestState>()(
  persist(
    (set) => ({
      ...initialState,
      setFirearm: (firearm) => 
        set((state) => ({ firearm: { ...state.firearm, ...firearm } })),
      setAmmo: (ammo) => 
        set((state) => ({ ammo: { ...state.ammo, ...ammo } })),
      setAtmosphere: (atmosphere) => 
        set((state) => ({ atmosphere: { ...state.atmosphere, ...atmosphere } })),
      setShot: (shot) => 
        set((state) => ({ shot: { ...state.shot, ...shot } })),
      reset: () => set(initialState),
    }),
    {
      name: 'ballistics-request',
      // Only persist specific parts of the state if needed
      partialize: (state) => ({
        firearm: state.firearm,
        ammo: state.ammo,
        atmosphere: state.atmosphere,
        shot: state.shot
      }),
    }
  )
);

// Helper function to format the request according to the Snipe Ballistics API
export const formatBallisticsRequest = (state: BallisticsRequestState) => {
  return {
    firearmProfile: {
      sight: {
        height: state.firearm.sightHeight, // Already a Measurement object with value and unit
      },
      barrel: {
        length: state.firearm.barrelLength, // Already a Measurement object with value and unit
        twist: {
          rate: state.firearm.twistRate, // Already a Measurement object with value and unit
          direction: state.firearm.twistDirection,
        },
      },
      zeroDistance: state.firearm.zeroDistance, // Already a Measurement object with value and unit
    },
    ammo: {
      bullet: {
        weight: state.ammo.bulletWeight, // Already a Measurement object with value and unit
        diameter: state.ammo.bulletDiameter, // Already a Measurement object with value and unit
        length: state.ammo.bulletLength, // Already a Measurement object with value and unit
        style: state.ammo.bulletStyle,
      },
      ballisticCoefficient: state.ammo.ballisticCoefficient, // Unitless value
      muzzleVelocity: state.ammo.muzzleVelocity, // Already a Measurement object with value and unit
      dragModel: state.ammo.dragModel || 'G1',
    },
    atmosphere: {
      temperature: state.atmosphere.temperature, // Already a Measurement object with value and unit
      pressure: state.atmosphere.pressure, // Already a Measurement object with value and unit
      humidity: state.atmosphere.humidity, // Percentage, unitless
      altitude: state.atmosphere.altitude, // Already a Measurement object with value and unit
      pressureType: state.atmosphere.pressureType || 'STATION',
    },
    shot: {
      range: state.shot.distance, // Already a Measurement object with value and unit
      elevationAngle: state.shot.angle, // Already a Measurement object with value and unit
      targetSize: state.shot.targetSize, // Already a Measurement object with value and unit
      cantAngle: state.shot.cantAngle, // Already a Measurement object with value and unit
      azimuth: state.shot.azimuth, // Already a Measurement object with value and unit
      latitude: state.shot.latitude, // Already a Measurement object with value and unit
      windSegments: state.shot.windSegments || [
        {
          maxRange: state.shot.distance, // Use the shot distance as default max range
          speed: state.shot.windSpeed, // Already a Measurement object with value and unit
          direction: state.shot.windAngle, // Already a Measurement object with value and unit
          verticalComponent: { value: 0, unit: state.shot.windSpeed.unit }, // Default to 0 with same unit as windSpeed
        }
      ],
    },
    preferences: {
      calculateSpinDrift: true,
      calculateCoriolisEffect: true,
      calculateAeroJump: true,
      unitPreferences: {
        unitMappings: [
          // Default unit preferences - these should be updated from user settings
          { unitTypeClassName: 'Range', unitName: 'YARDS' as Unit },
          { unitTypeClassName: 'ScopeAdjustment', unitName: 'MILS' as Unit },
          { unitTypeClassName: 'Temperature', unitName: 'FAHRENHEIT' as Unit },
          { unitTypeClassName: 'BulletVelocity', unitName: 'FEET_PER_SECOND' as Unit },
          { unitTypeClassName: 'WindSpeed', unitName: 'MILES_PER_HOUR' as Unit },
          { unitTypeClassName: 'WindDirection', unitName: 'DEGREES' as Unit },
          { unitTypeClassName: 'AtmosphericPressure', unitName: 'INCHES_MERCURY' as Unit },
          { unitTypeClassName: 'BulletWeight', unitName: 'GRAINS' as Unit },
        ],
      },
    },
  };
};
