import { renderHook, act } from '@testing-library/react-hooks';
import { BallisticsStoreProvider } from '../../context/BallisticsStoreProvider';
import { useBallistics } from '../useBallistics';
import { FirearmProfile, Ammo, Atmosphere, Shot, WindSegment } from '../../types/ballistics';

// Helper function to wrap hook with provider
const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BallisticsStoreProvider>
    {children}
  </BallisticsStoreProvider>
);

describe('useBallistics', () => {
  it('should provide initial state', () => {
    const { result } = renderHook(() => useBallistics(), { wrapper });
    
    expect(result.current.firearmProfile).toBeDefined();
    expect(result.current.ammo).toBeDefined();
    expect(result.current.atmosphere).toBeDefined();
    expect(result.current.shot).toBeDefined();
    expect(result.current.preferences).toBeDefined();
  });

  it('should update firearm profile', () => {
    const { result } = renderHook(() => useBallistics(), { wrapper });
    
    const newFirearm: Partial<FirearmProfile> = {
      name: 'Test Rifle',
      barrelLength: { value: 24, unit: 'INCHES' },
    };
    
    act(() => {
      result.current.updateFirearmProfile({ firearmProfile: newFirearm });
    });
    
    expect(result.current.firearmProfile).toMatchObject(newFirearm);
  });

  it('should update ammo', () => {
    const { result } = renderHook(() => useBallistics(), { wrapper });
    
    const newAmmo: Partial<Ammo> = {
      bulletWeight: { value: 168, unit: 'GRAINS' },
      muzzleVelocity: { value: 2600, unit: 'FPS' },
    };
    
    act(() => {
      result.current.updateAmmo({ ammo: newAmmo });
    });
    
    expect(result.current.ammo).toMatchObject(newAmmo);
  });

  it('should update atmosphere', () => {
    const { result } = renderHook(() => useBallistics(), { wrapper });
    
    const newAtmosphere: Partial<Atmosphere> = {
      temperature: { value: 70, unit: 'FAHRENHEIT' },
      pressure: { value: 29.92, unit: 'IN_HG' },
      humidity: 50,
    };
    
    act(() => {
      result.current.updateAtmosphere({ atmosphere: newAtmosphere });
    });
    
    expect(result.current.atmosphere).toMatchObject(newAtmosphere);
  });

  it('should update shot', () => {
    const { result } = renderHook(() => useBallistics(), { wrapper });
    
    const newShot: Partial<Shot> = {
      targetDistance: { value: 100, unit: 'YARDS' },
      windSpeed: { value: 5, unit: 'MPH' },
    };
    
    act(() => {
      result.current.updateShot({ shot: newShot });
    });
    
    expect(result.current.shot).toMatchObject(newShot);
  });

  it('should update wind segments', () => {
    const { result } = renderHook(() => useBallistics(), { wrapper });
    
    const newSegment: WindSegment = {
      maxRange: { value: 100, unit: 'YARDS' },
      speed: { value: 10, unit: 'MPH' },
      direction: { value: 90, unit: 'DEGREES' },
    };
    
    // Add a wind segment
    act(() => {
      result.current.addWindSegment(newSegment);
    });
    
    expect(result.current.shot.windSegments).toContainEqual(newSegment);
    
    // Update the wind segment
    const updatedSegment = { ...newSegment, speed: { value: 15, unit: 'MPH' } };
    
    act(() => {
      result.current.updateWindSegment(0, { speed: { value: 15, unit: 'MPH' } });
    });
    
    expect(result.current.shot.windSegments[0]).toMatchObject(updatedSegment);
    
    // Remove the wind segment
    act(() => {
      result.current.removeWindSegment(0);
    });
    
    expect(result.current.shot.windSegments).toHaveLength(0);
  });

  it('should convert units', () => {
    const { result } = renderHook(() => useBallistics(), { wrapper });
    
    // Test length conversion
    const meters = result.current.convertToUnit(100, 'YARDS', 'METERS');
    expect(meters).toBeCloseTo(91.44);
    
    // Test temperature conversion
    const fahrenheit = result.current.convertToUnit(0, 'CELSIUS', 'FAHRENHEIT');
    expect(fahrenheit).toBe(32);
  });

  it('should convert measurements', () => {
    const { result } = renderHook(() => useBallistics(), { wrapper });
    
    const measurement = { value: 100, unit: 'YARDS' };
    const converted = result.current.convertMeasurement(measurement, 'METERS');
    
    expect(converted.value).toBeCloseTo(91.44);
    expect(converted.unit).toBe('METERS');
  });

  it('should handle null or undefined measurements', () => {
    const { result } = renderHook(() => useBallistics(), { wrapper });
    
    // Test with null
    const nullResult = result.current.convertMeasurement(null as any, 'METERS');
    expect(nullResult).toEqual({ value: 0, unit: 'METERS' });
    
    // Test with undefined
    const undefinedResult = result.current.convertMeasurement(undefined as any, 'METERS');
    expect(undefinedResult).toEqual({ value: 0, unit: 'METERS' });
  });
});
