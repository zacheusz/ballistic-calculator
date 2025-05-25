import { act } from '@testing-library/react';
import { useBallisticsRequestStore } from './useBallisticsRequestStore';

// Mock the persist middleware
const mockPersist = (config) => (set, get, api) => {
  return config(set, get, api);
};

// Mock the create function to use our mockPersist
jest.mock('zustand');
jest.mock('zustand/middleware', () => ({
  persist: (config) => (set, get, api) => 
    mockPersist(config)(set, get, api)
}));

describe('useBallisticsRequestStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { reset } = useBallisticsRequestStore.getState();
    reset();
  });

  it('should have initial state', () => {
    const state = useBallisticsRequestStore.getState();
    expect(state.firearm.sightHeight).toBe(2.5);
    expect(state.ammo.bulletWeight).toBe(168);
    expect(state.atmosphere.temperature).toBe(59);
    expect(state.shot.distance).toBe(500);
  });

  it('should update firearm properties', () => {
    const { setFirearm } = useBallisticsRequestStore.getState();
    
    act(() => {
      setFirearm({ sightHeight: 3.0, barrelLength: 26 });
    });
    
    const state = useBallisticsRequestStore.getState();
    expect(state.firearm.sightHeight).toBe(3.0);
    expect(state.firearm.barrelLength).toBe(26);
    // Check other properties remain unchanged
    expect(state.firearm.zeroDistance).toBe(100);
  });

  it('should update ammo properties', () => {
    const { setAmmo } = useBallisticsRequestStore.getState();
    
    act(() => {
      updateAmmo({ ammo: { bulletWeight: 175, muzzleVelocity: 2700 } });
    });
    
    const state = useBallisticsRequestStore.getState();
    expect(state.ammo.bulletWeight).toBe(175);
    expect(state.ammo.muzzleVelocity).toBe(2700);
  });

  it('should update atmosphere properties', () => {
    const { setAtmosphere } = useBallisticsRequestStore.getState();
    
    act(() => {
      updateAtmosphere({ atmosphere: { temperature: 70, altitude: 1000 } });
    });
    
    const state = useBallisticsRequestStore.getState();
    expect(state.atmosphere.temperature).toBe(70);
    expect(state.atmosphere.altitude).toBe(1000);
  });

  it('should update shot properties', () => {
    const { setShot } = useBallisticsRequestStore.getState();
    
    act(() => {
      updateShot({ shot: { distance: 300, windSpeed: 10 } });
    });
    
    const state = useBallisticsRequestStore.getState();
    expect(state.shot.distance).toBe(300);
    expect(state.shot.windSpeed).toBe(10);
  });

  it('should reset to initial state', () => {
    const { setFirearm, setAmmo, reset } = useBallisticsRequestStore.getState();
    
    act(() => {
      setFirearm({ sightHeight: 3.0 });
      updateAmmo({ ammo: { bulletWeight: 175 } });
    });
    
    // Verify changes were made
    let state = useBallisticsRequestStore.getState();
    expect(state.firearm.sightHeight).toBe(3.0);
    expect(state.ammo.bulletWeight).toBe(175);
    
    // Reset and verify
    act(() => {
      reset();
    });
    
    state = useBallisticsRequestStore.getState();
    expect(state.firearm.sightHeight).toBe(2.5);
    expect(state.ammo.bulletWeight).toBe(168);
  });

  it('should format the request correctly', () => {
    const { formatBallisticsRequest } = useBallisticsRequestStore.getState();
    const request = formatBallisticsRequest(useBallisticsRequestStore.getState());
    
    expect(request).toEqual({
      firearmProfile: {
        sight: {
          height: 2.5,
        },
        barrel: {
          length: 24,
          twist: {
            rate: 10,
            direction: 'right',
          },
        },
        zeroDistance: 100,
      },
      ammo: {
        bullet: {
          weight: 168,
          diameter: 0.308,
          length: 1.2,
          style: 'boat-tail',
        },
        ballisticCoefficient: 0.45,
        muzzleVelocity: 2600,
      },
      atmosphere: {
        temperature: 59,
        pressure: 29.92,
        humidity: 50,
        altitude: 0,
      },
      shot: {
        target: {
          distance: 500,
          angle: 0,
          size: 12,
        },
        wind: {
          speed: 5,
          angle: 90,
        },
        cantAngle: 0,
      },
    });
  });
});
