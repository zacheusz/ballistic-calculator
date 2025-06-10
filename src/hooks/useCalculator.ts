import { useState, useCallback } from 'react';
import { useBallistics } from './useBallistics';
import apiModule from '../services/api';
import { SolutionCardResponse, Solution } from '../types/apiTypes';
import { BallisticsRequest } from '../types/ballistics';

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

import { Unit } from '../types/ballistics';

/**
 * Custom hook for calculator page state management
 * Focuses only on calculator-specific UI state and operations
 * while leveraging the shared ballistics store for domain data
 */
export const useCalculator = () => {
  // Use our ballistics hook for domain state
  const {
    atmosphere,
    shot,
    preferences,
    updateAtmosphere,
    updateShot,
    updateWindSegment,
    addWindSegment,
    removeWindSegment,
    toApiRequest
  } = useBallistics();

  // Calculator-specific UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SolutionCardResponse | null>(null);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<CalculationMode>('HUD');
  const [rangeCardSettings, setRangeCardSettings] = useState<RangeCardSettings>({
    start: 100,
    step: 100,
    unit: shot.range.unit as Unit
  });

  // Handler for calculation mode changes
  const handleModeChange = useCallback((newMode: CalculationMode) => {
    setMode(newMode);
  }, []);

  // Handler for range card settings changes
  const handleRangeCardSettingChange = useCallback((field: keyof RangeCardSettings, value: any) => {
    setRangeCardSettings(prev => ({ ...prev, [field]: value }));
  }, []);

  // Calculate ballistics
  const calculateBallistics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Get the base request data
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
        // HUD mode - we need to create a new object without range card settings
        // The API expects Measurement objects with value and unit, but will ignore
        // range card settings with zero values for HUD mode
        requestData = {
          ...baseRequestData,
          preferences: {
            ...baseRequestData.preferences,
            // Use zero values which the API will ignore for HUD mode
            rangeCardStart: { value: 0, unit: baseRequestData.shot.range.unit },
            rangeCardStep: { value: 0, unit: baseRequestData.shot.range.unit }
          }
        };
        
        console.log('HUD mode request:');
        console.log('- Shot range:', JSON.stringify(requestData.shot.range));
        console.log('- Range card start:', JSON.stringify(requestData.preferences.rangeCardStart));
        console.log('- Range card step:', JSON.stringify(requestData.preferences.rangeCardStep));
      }

      // Call API
      const response = await apiModule.computeBallisticSolution(requestData);
      setResults(response);
    } catch (err: any) {
      setError(err.message || 'Failed to calculate ballistics');
    } finally {
      setLoading(false);
    }
  }, [mode, rangeCardSettings, toApiRequest]);

  // Reset results
  const resetResults = useCallback(() => {
    setResults(null);
    setError('');
  }, []);

  return {
    // Ballistics state
    atmosphere,
    shot,
    preferences,
    
    // Calculator-specific state
    loading,
    results,
    error,
    mode,
    rangeCardSettings,
    
    // Actions
    updateAtmosphere,
    updateShot,
    updateWindSegment,
    addWindSegment,
    removeWindSegment,
    handleModeChange,
    handleRangeCardSettingChange,
    calculateBallistics,
    resetResults
  };
};

export default useCalculator;
