import { useState, useCallback, useEffect } from 'react';
import useBallisticsStore from '../stores/useBallisticsStore';
import apiModule from '../services/api';
import { SolutionCardResponse, Solution } from '../types/apiTypes';
import { BallisticsRequest, Preferences } from '../types/ballistics';
import { Unit } from '../types/ballistics';

// Re-export Solution type for convenience
export type { Solution, SolutionCardResponse as BallisticsResults };

// Define calculation mode type
export type CalculationMode = 'HUD' | 'RANGE_CARD';

// Define range card settings interface
export interface RangeCardSettings {
  start: number;
  step: number;
  unit: Unit;
}

// Define validation error type
export interface ValidationErrors {
  shot?: {
    range?: {
      value?: string;
    };
  };
}

// Define touched fields type
export interface TouchedFields {
  shot?: {
    range?: {
      value?: boolean;
    };
  };
}

/**
 * Custom hook for calculator page state management
 * Focuses only on calculator-specific UI state and operations
 * while leveraging the shared ballistics store for domain data
 */
export const useCalculator = () => {
  // Get store actions directly
  const updateAtmosphere = useBallisticsStore(state => state.updateAtmosphere);
  const updateShot = useBallisticsStore(state => state.updateShot);
  const updateWindSegment = useBallisticsStore(state => state.updateWindSegment);
  const addWindSegment = useBallisticsStore(state => state.addWindSegment);
  const removeWindSegment = useBallisticsStore(state => state.removeWindSegment);

  // Get values without subscribing - use getState() snapshots
  const getCurrentRangeValue = useCallback(() => {
    return useBallisticsStore.getState().shot.range.value;
  }, []);

  const getCurrentShotRangeUnit = useCallback(() => {
    return useBallisticsStore.getState().shot.range.unit;
  }, []);

  // Calculator-specific UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SolutionCardResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<CalculationMode>('HUD');
  
  // Initialize rangeCardSettings with a stable default
  const [rangeCardSettings, setRangeCardSettings] = useState<RangeCardSettings>({
    start: 100,
    step: 100,
    unit: 'METERS' as Unit
  });
  
  // Update rangeCardSettings unit when shot.range.unit changes
  useEffect(() => {
    const shotRangeUnit = getCurrentShotRangeUnit();
    setRangeCardSettings(prev => ({
      ...prev,
      unit: shotRangeUnit as Unit
    }));
  }, [getCurrentShotRangeUnit]);

  // Form validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});

  // Handler for calculation mode changes
  const handleModeChange = useCallback((newMode: CalculationMode) => {
    setMode(newMode);
  }, []);

  // Handler for range card settings changes
  const handleRangeCardSettingChange = useCallback((field: keyof RangeCardSettings, value: any) => {
    setRangeCardSettings(prev => ({ ...prev, [field]: value }));
  }, []);

  // Validate form fields
  const validateForm = useCallback(() => {
    const newErrors: ValidationErrors = {};
    
    // Validate shot range value
    const rangeValue = getCurrentRangeValue();
    if (!rangeValue) {
      newErrors.shot = {
        range: {
          value: 'Range is required'
        }
      };
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [getCurrentRangeValue]);

  // Handle field blur
  const handleBlur = useCallback((e: React.FocusEvent<any>) => {
    const { name } = e.target;
    
    // Update touched state based on field name
    if (name === 'shot.range.value') {
      setTouched(prev => ({
        ...prev,
        shot: {
          ...prev.shot,
          range: {
            ...prev.shot?.range,
            value: true
          }
        }
      }));
    }
    
    // Validate on blur
    validateForm();
  }, [validateForm]);

  // Calculate ballistics
  const calculateBallistics = useCallback(async (enableRequestLogging?: boolean) => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    try {
      setLoading(true);
      setError('');

      // Get the base request data (get fresh reference each time)
      const toApiRequest = useBallisticsStore.getState().toApiRequest;
      const baseRequestData = toApiRequest();
      
      console.log(`Current mode: ${mode}`);
      console.log('Base request data preferences:', JSON.stringify(baseRequestData.preferences));
      
      // Create a new request object based on the calculation mode
      let requestData: BallisticsRequest;
      
      if (mode === 'RANGE_CARD') {
        // RANGE_CARD mode - include range card settings
        const { start, step, unit } = rangeCardSettings;
        
        console.log(`Range card settings: start=${start}, step=${step}, unit=${unit}`);
        
        // Create a new request with range card settings
        requestData = {
          ...baseRequestData,
          // Include range card settings in preferences
          preferences: {
            ...baseRequestData.preferences,
            rangeCardStart: { value: start, unit },
            rangeCardStep: { value: step, unit }
          }
        };
        
        console.log('RANGE_CARD mode request:');
        console.log('- Shot range:', JSON.stringify(requestData.shot.range));
        console.log('- Range card start:', JSON.stringify(requestData.preferences.rangeCardStart));
        console.log('- Range card step:', JSON.stringify(requestData.preferences.rangeCardStep));
      } else {
        // HUD mode - exclude range card settings from preferences
        const hudPreferences: Omit<Preferences, 'rangeCardStart' | 'rangeCardStep'> = {
          calculateSpinDrift: baseRequestData.preferences.calculateSpinDrift,
          calculateCoriolisEffect: baseRequestData.preferences.calculateCoriolisEffect,
          calculateAeroJump: baseRequestData.preferences.calculateAeroJump,
          unitPreferences: baseRequestData.preferences.unitPreferences,
          interpolateRange: baseRequestData.preferences.interpolateRange
        };
        
        requestData = {
          ...baseRequestData,
          preferences: hudPreferences as Preferences
        };
        
        console.log('HUD mode request:');
        console.log('- Shot range:', JSON.stringify(requestData.shot.range));
        console.log('- Range card settings excluded from preferences');
      }

      // Call API with optional logging parameter
      const response = await apiModule.computeBallisticSolution(requestData, enableRequestLogging);
      setResults(response);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate ballistics');
    } finally {
      setLoading(false);
    }
  }, [mode, rangeCardSettings, validateForm]);

  // Reset results
  const resetResults = useCallback(() => {
    setResults(null);
    setError('');
  }, []);

  return {
    // Calculator-specific state
    loading,
    results,
    error,
    mode,
    rangeCardSettings,
    
    // Form validation state
    errors,
    touched,
    
    // Actions
    updateAtmosphere,
    updateShot,
    updateWindSegment,
    addWindSegment,
    removeWindSegment,
    handleModeChange,
    handleRangeCardSettingChange,
    calculateBallistics,
    resetResults,
    handleBlur,
    validateForm
  };
};

export default useCalculator;
