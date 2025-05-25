import { act } from '@testing-library/react';
import useBallisticsStore from '../useBallisticsStore';
import { getDefaultConfig } from '@/utils/ballisticsUtils';

// Mock the persist middleware
const mockPersist = (config: any) => (set: any, get: any, api: any) => {
  return config(set, get, api);
};

// Mock the create function to use our mockPersist
jest.mock('zustand');
jest.mock('zustand/middleware', () => ({
  persist: (config: any) => (set: any, get: any, api: any) => 
    mockPersist(config)(set, get, api)
}));

describe('useBallisticsStore', () => {
  beforeEach(() => {
    // Reset the store before each test
    const { resetToDefault } = useBallisticsStore.getState();
    act(() => {
      resetToDefault();
    });
  });

  it('should have initial state', () => {
    const state = useBallisticsStore.getState();
    const defaultConfig = getDefaultConfig();
    
    expect(state.firearmProfile.name).toBe(defaultConfig.firearmProfile.name);
    expect(state.ammo.bulletModel).toBe(defaultConfig.ammo.bulletModel);
    expect(state.atmosphere.temperature.value).toBe(defaultConfig.atmosphere.temperature.value);
    expect(state.shot.range.value).toBe(defaultConfig.shot.range.value);
  });

  it('should update firearm profile', () => {
    const { updateFirearmProfile } = useBallisticsStore.getState();
    
    act(() => {
      updateFirearmProfile({ name: 'Custom Rifle', sightHeight: { value: 2.5, unit: 'INCHES' } });
    });
    
    const state = useBallisticsStore.getState();
    expect(state.firearmProfile.name).toBe('Custom Rifle');
    expect(state.firearmProfile.sightHeight.value).toBe(2.5);
    // Check other properties remain unchanged
    expect(state.firearmProfile.barreTwist.value).toBe(12.0);
  });

  it('should update ammo', () => {
    const { updateAmmo } = useBallisticsStore.getState();
    
    act(() => {
      updateAmmo({ 
        bulletModel: 'Custom Bullet', 
        muzzleVelocity: { value: 2600, unit: 'FEET_PER_SECOND' } 
      });
    });
    
    const state = useBallisticsStore.getState();
    expect(state.ammo.bulletModel).toBe('Custom Bullet');
    expect(state.ammo.muzzleVelocity.value).toBe(2600);
  });

  it('should update atmosphere', () => {
    const { updateAtmosphere } = useBallisticsStore.getState();
    
    act(() => {
      updateAtmosphere({ 
        temperature: { value: 75, unit: 'FAHRENHEIT' },
        altitude: { value: 1000, unit: 'FEET' }
      });
    });
    
    const state = useBallisticsStore.getState();
    expect(state.atmosphere.temperature.value).toBe(75);
    expect(state.atmosphere.altitude.value).toBe(1000);
  });

  it('should update shot parameters', () => {
    const { updateShot } = useBallisticsStore.getState();
    
    act(() => {
      updateShot({ 
        range: { value: 1000, unit: 'YARDS' },
        elevationAngle: { value: 5, unit: 'DEGREES' }
      });
    });
    
    const state = useBallisticsStore.getState();
    expect(state.shot.range.value).toBe(1000);
    expect(state.shot.elevationAngle.value).toBe(5);
  });

  it('should update wind segments', () => {
    const { updateWindSegment } = useBallisticsStore.getState();
    
    act(() => {
      updateWindSegment(0, { 
        speed: { value: 10, unit: 'MILES_PER_HOUR' },
        direction: { value: 9, unit: 'CLOCK' }
      });
    });
    
    const state = useBallisticsStore.getState();
    expect(state.shot.windSegments[0].speed.value).toBe(10);
    expect(state.shot.windSegments[0].direction.value).toBe(9);
  });

  it('should reset to default', () => {
    const { updateFirearmProfile, updateAmmo, resetToDefault } = useBallisticsStore.getState();
    const defaultConfig = getDefaultConfig();
    
    // Make some changes
    act(() => {
      updateFirearmProfile({ name: 'Custom Rifle' });
      updateAmmo({ bulletModel: 'Custom Bullet' });
    });
    
    // Verify changes
    let state = useBallisticsStore.getState();
    expect(state.firearmProfile.name).toBe('Custom Rifle');
    expect(state.ammo.bulletModel).toBe('Custom Bullet');
    
    // Reset and verify
    act(() => {
      resetToDefault();
    });
    
    state = useBallisticsStore.getState();
    expect(state.firearmProfile.name).toBe(defaultConfig.firearmProfile.name);
    expect(state.ammo.bulletModel).toBe(defaultConfig.ammo.bulletModel);
  });

  it('should format API request correctly', () => {
    const { toApiRequest } = useBallisticsStore.getState();
    const request = toApiRequest();
    
    expect(request).toHaveProperty('firearmProfile');
    expect(request).toHaveProperty('ammo');
    expect(request).toHaveProperty('atmosphere');
    expect(request).toHaveProperty('shot');
    expect(request).toHaveProperty('preferences');
    
    // Check a few nested properties to ensure structure is correct
    expect(request.firearmProfile).toHaveProperty('name');
    expect(request.ammo).toHaveProperty('muzzleVelocity');
    expect(request.shot).toHaveProperty('windSegments');
  });
});
