import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FirearmProfile {
  sightHeight: number;
  twistRate: number;
  twistDirection: 'right' | 'left';
  barrelLength: number;
  zeroDistance: number;
  barrelTwist: number;
}

export interface Ammunition {
  bulletWeight: number;
  bulletDiameter: number;
  ballisticCoefficient: number;
  muzzleVelocity: number;
  bulletLength: number;
  bulletStyle: 'flat' | 'boat-tail' | 'hollow-point' | 'spitzer' | 'round-nose';
}

export interface Atmosphere {
  temperature: number;
  pressure: number;
  humidity: number;
  altitude: number;
}

export interface ShotParameters {
  distance: number;
  angle: number;
  targetSize: number;
  windSpeed: number;
  windAngle: number;
  cantAngle: number;
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
    sightHeight: 2.5, // inches
    twistRate: 10, // 1:X inches
    twistDirection: 'right' as const,
    barrelLength: 24, // inches
    zeroDistance: 100, // yards
    barrelTwist: 9 // inches per turn
  },
  ammo: {
    bulletWeight: 168, // grains
    bulletDiameter: 0.308, // inches
    ballisticCoefficient: 0.45,
    muzzleVelocity: 2600, // fps
    bulletLength: 1.2, // inches
    bulletStyle: 'boat-tail' as const
  },
  atmosphere: {
    temperature: 59, // °F
    pressure: 29.92, // inHg
    humidity: 50, // %
    altitude: 0 // feet
  },
  shot: {
    distance: 500, // yards
    angle: 0, // degrees
    targetSize: 12, // inches
    windSpeed: 5, // mph
    windAngle: 90, // degrees (0-359, 0 = headwind, 90 = right to left, 180 = tailwind, 270 = left to right)
    cantAngle: 0 // degrees
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
        height: state.firearm.sightHeight,
      },
      barrel: {
        length: state.firearm.barrelLength,
        twist: {
          rate: state.firearm.twistRate,
          direction: state.firearm.twistDirection,
        },
      },
      zeroDistance: state.firearm.zeroDistance,
    },
    ammo: {
      bullet: {
        weight: state.ammo.bulletWeight,
        diameter: state.ammo.bulletDiameter,
        length: state.ammo.bulletLength,
        style: state.ammo.bulletStyle,
      },
      ballisticCoefficient: state.ammo.ballisticCoefficient,
      muzzleVelocity: state.ammo.muzzleVelocity,
    },
    atmosphere: {
      temperature: state.atmosphere.temperature,
      pressure: state.atmosphere.pressure,
      humidity: state.atmosphere.humidity,
      altitude: state.atmosphere.altitude,
    },
    shot: {
      target: {
        distance: state.shot.distance,
        angle: state.shot.angle,
        size: state.shot.targetSize,
      },
      wind: {
        speed: state.shot.windSpeed,
        angle: state.shot.windAngle,
      },
      cantAngle: state.shot.cantAngle,
    },
  };
};
