import { migrateToZustand, cleanupOldStorage } from '../migrateToZustand';
import { getDefaultConfig } from '../ballisticsUtils';
import storageService, { STORAGE_KEYS } from '../../services/storageService';

describe('migrateToZustand', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value.toString();
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // Clear all mocks and reset localStorage
    jest.clearAllMocks();
    (global as any).localStorage = localStorageMock;
    localStorage.clear();
  });

  it('should return default config when no old data exists', () => {
    const result = migrateToZustand();
    const defaultConfig = getDefaultConfig();
    
    expect(result).toEqual(defaultConfig);
  });

  it('should migrate unit preferences', () => {
    // Set up old storage
    const oldUnitPrefs = {
      Range: 'METERS',
      BulletWeight: 'GRAMS',
      Temperature: 'CELSIUS',
      // ... other preferences
    };
    
    storageService.saveToStorage(STORAGE_KEYS.UNIT_PREFERENCES, oldUnitPrefs);
    
    const result = migrateToZustand();
    
    // Check that unit preferences were migrated
    expect(result.preferences.unitPreferences.unitMappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          unitTypeClassName: 'Range',
          unitName: 'METERS'
        }),
        expect.objectContaining({
          unitTypeClassName: 'BulletWeight',
          unitName: 'GRAMS'
        }),
        expect.objectContaining({
          unitTypeClassName: 'Temperature',
          unitName: 'CELSIUS'
        })
      ])
    );
  });

  it('should migrate firearm profile', () => {
    const oldFirearm = {
      name: 'Test Rifle',
      sightHeight: { value: 2.5, unit: 'INCHES' },
      // ... other firearm properties
    };
    
    storageService.saveToStorage(STORAGE_KEYS.FIREARM_PROFILE, oldFirearm);
    
    const result = migrateToZustand();
    
    expect(result.firearmProfile).toEqual(
      expect.objectContaining({
        name: 'Test Rifle',
        sightHeight: { value: 2.5, unit: 'INCHES' },
        // ... other expected properties
      })
    );
  });

  it('should migrate ammo data', () => {
    const oldAmmo = {
      bulletWeight: { value: 168, unit: 'GRAINS' },
      muzzleVelocity: { value: 2600, unit: 'FPS' },
      // ... other ammo properties
    };
    
    storageService.saveToStorage(STORAGE_KEYS.AMMO, oldAmmo);
    
    const result = migrateToZustand();
    
    expect(result.ammo).toEqual(
      expect.objectContaining({
        bulletWeight: { value: 168, unit: 'GRAINS' },
        muzzleVelocity: { value: 2600, unit: 'FPS' },
        // ... other expected properties
      })
    );
  });

  it('should clean up old storage', () => {
    // Set up old storage
    storageService.saveToStorage(STORAGE_KEYS.UNIT_PREFERENCES, { Range: 'METERS' });
    storageService.saveToStorage(STORAGE_KEYS.FIREARM_PROFILE, { name: 'Test' });
    storageService.saveToStorage(STORAGE_KEYS.AMMO, { bulletWeight: 168 });
    
    // Run migration and cleanup
    migrateToZustand();
    cleanupOldStorage();
    
    // Check that old storage was cleaned up
    expect(storageService.loadFromStorage(STORAGE_KEYS.UNIT_PREFERENCES, null)).toBeNull();
    expect(storageService.loadFromStorage(STORAGE_KEYS.FIREARM_PROFILE, null)).toBeNull();
    expect(storageService.loadFromStorage(STORAGE_KEYS.AMMO, null)).toBeNull();
  });

  it('should handle missing data gracefully', () => {
    // Set up only some old storage
    storageService.saveToStorage(STORAGE_KEYS.UNIT_PREFERENCES, { Range: 'METERS' });
    
    const result = migrateToZustand();
    
    // Should still return a valid config
    expect(result).toBeDefined();
    expect(result.firearmProfile).toBeDefined();
    expect(result.ammo).toBeDefined();
  });
});
