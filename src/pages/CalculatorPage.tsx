import React, { useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  AlertTitle 
} from '@mui/material';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import { useCalculator } from '../hooks/useCalculator';
import useBallisticsStore from '../stores/useBallisticsStore';



// Import components
import BallisticsResultsGrid from '../components/BallisticsResultsGrid';
import AtmosphereComponent from '../components/AtmosphereComponent';
import ShotComponent from '../components/ShotComponent';
import ModeComponent from '../components/ModeComponent';



const CalculatorPage: React.FC = () => {
  console.log('🔄 CalculatorPage: Component render started');
  
  const { t } = useTranslation();
  
  // Create refs for input fields to position tooltips - using any to avoid type errors with component props
  const temperatureInputRef = useRef<any>(null);
  const pressureInputRef = useRef<any>(null);
  const altitudeInputRef = useRef<any>(null);
  const rangeInputRef = useRef<any>(null);
  const elevationAngleInputRef = useRef<any>(null);
  
  // Create refs for wind segment fields
  const windSegmentRefs = useRef<Record<string, React.RefObject<any>>>({});
  
  // Helper function to get or create a ref for a wind segment field
  const getWindSegmentRef = (index: number, field: string): React.RefObject<any> => {
    const key = `wind_${index}_${field}`;
    if (!windSegmentRefs.current[key]) {
      windSegmentRefs.current[key] = React.createRef<any>();
    }
    return windSegmentRefs.current[key];
  };

  // Get API key from Zustand store to determine if configured
  const apiKey = useAppConfigStore(state => state.apiKey);
  // Derive isConfigured from apiKey presence
  const isConfigured = !!apiKey;
  
  console.log('🔍 CalculatorPage: About to call useCalculator hook');
  
  // Use our calculator hook for calculator-specific state only (not ballistics data)
  const {
    // Calculator-specific state only
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
    addWindSegment,
    removeWindSegment,
    handleModeChange,
    handleRangeCardSettingChange,
    calculateBallistics,
    handleBlur,
  } = useCalculator();
  
  console.log('✅ CalculatorPage: useCalculator hook completed');
  
  console.log('🔍 CalculatorPage: Got store actions');
  
  // Simplified logging to avoid TypeScript issues
  console.log('📊 CalculatorPage: Component render - checking what triggers re-renders');
  
  // Get current state values only when needed for rendering (not subscribing to changes)
  const currentState = useBallisticsStore.getState();
  const atmosphere = currentState.atmosphere;
  const shot = currentState.shot;
  const preferences = currentState.preferences;
  
  // Subscribe only to wind segments length to trigger re-renders when segments are added/removed
  // This is a minimal subscription that doesn't cause re-renders on other shot changes
  const windSegmentsLength = useBallisticsStore(state => state.shot.windSegments.length);
  
  // Force a fresh state read when wind segments length changes
  const freshShot = windSegmentsLength !== shot.windSegments.length 
    ? useBallisticsStore.getState().shot 
    : shot;
  
  // Extract calculation options from preferences
  const calculationOptions = preferences || {};
  
  // Add effect to track component mounting/unmounting
  useEffect(() => {
    console.log('🟢 CalculatorPage: Component mounted');
    return () => {
      console.log('🔴 CalculatorPage: Component unmounted');
    };
  }, []);
  
  // Create stable handlers using useCallback to prevent unnecessary re-renders
  const handleAtmosphereChange = useCallback((field: string, value: any) => {
    console.log(`🌡️ CalculatorPage: handleAtmosphereChange called - field: ${field}, value:`, value);
    // For simple values (non-measurement objects)
    // Use partial update - only update the specific field
    updateAtmosphere({ [field]: value });
  }, [updateAtmosphere]);
  
  // Specific handler for atmosphere measurement changes
  const handleAtmosphereMeasurementChange = useCallback((field: string, measurement: any) => {
    console.log(`🌡️ CalculatorPage: handleAtmosphereMeasurementChange called - field: ${field}, measurement:`, measurement);
    // For measurement objects (with value and unit)
    // Use partial update - only update the specific field
    if (field === 'temperature' || field === 'pressure' || field === 'altitude') {
      updateAtmosphere({ [field]: measurement });
    }
  }, [updateAtmosphere]);
  
  // Specific handler for shot measurement changes
  const handleShotMeasurementChange = useCallback((field: string, measurement: any) => {
    console.log(`🎯 CalculatorPage: handleShotMeasurementChange called - field: ${field}, measurement:`, measurement);
    // For measurement objects (with value and unit)
    // Use partial update - only update the specific field
    if (
      field === 'range' || 
      field === 'elevationAngle' || 
      field === 'powderTemp' || 
      field === 'targetSpeed' || 
      field === 'targetAngle' || 
      field === 'azimuth' || 
      field === 'latitude'
    ) {
      updateShot({ [field]: measurement });
    } else if (field === 'windSegments') {
      updateShot({ windSegments: measurement });
    }
  }, [updateShot]);

  console.log('✅ CalculatorPage: Component render completed');

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('calcTitle')}
      </Typography>
      
      {!isConfigured && (
        <Alert severity="warning" sx={{ mb: 4 }}>
          <AlertTitle>{t('calcNotConfigured')}</AlertTitle>
          {t('calcConfigureApiKey')} <Link to="/config?tab=api">{t('calcConfigLink')}</Link>
        </Alert>
      )}
      
      <form onSubmit={(e) => {
        e.preventDefault();
        calculateBallistics();
      }}>
            {/* Top section with two columns */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 4 }}>
              {/* Left column for Atmosphere and Mode components */}
              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                <AtmosphereComponent
                  values={{ atmosphere }}
                  handleBlur={handleBlur}
                  handleChange={({ target }) => {
                    const { name, value } = target;
                    handleAtmosphereChange(name, value);
                  }}
                  handleAtmosphereChange={handleAtmosphereMeasurementChange}
                  handleAtmosphereSimpleChange={(field, value) => {
                    handleAtmosphereChange(field, value);
                  }}
                  loading={loading}
                  temperatureInputRef={temperatureInputRef}
                  pressureInputRef={pressureInputRef}
                  altitudeInputRef={altitudeInputRef}
                />
                
                <ModeComponent
                  mode={mode}
                  rangeCardSettings={rangeCardSettings}
                  handleModeChange={handleModeChange}
                  handleRangeCardSettingChange={handleRangeCardSettingChange}
                  loading={loading}
                />
              </Box>
              
              {/* Right column for Shot component */}
              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                <ShotComponent
                  values={{ shot: freshShot }}
                  handleBlur={handleBlur}
                  handleShotChange={handleShotMeasurementChange}
                  loading={loading}
                  errors={errors}
                  touched={touched}
                  calculationOptions={calculationOptions}
                  rangeInputRef={rangeInputRef}
                  elevationAngleInputRef={elevationAngleInputRef}
                  getWindSegmentRef={getWindSegmentRef}
                  addWindSegment={addWindSegment}
                  removeWindSegment={removeWindSegment}
                />
              </Box>
            </Box>
            
            {/* Centered Calculate button */}
            <Box sx={{ width: '100%', mb: 4 }}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      type="submit"
                      disabled={loading || !isConfigured}
                      sx={{ minWidth: '150px' }}
                    >
                      {loading ? <CircularProgress size={24} /> : t('calcCalculateBallistics')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
            
            {/* Error message */}
            {error && (
              <Box sx={{ mb: 4 }}>
                <Alert severity="error">
                  <AlertTitle>{t('calcError')}</AlertTitle>
                  {error}
                </Alert>
              </Box>
            )}
            
            {/* Results section */}
            {results && (
              <Box id="results">
                <Card>
                  <CardHeader title={t('calcBallisticSolution')} />
                  <CardContent>
                    <BallisticsResultsGrid
                      results={results.solutions || []}
                      unitPreferences={{
                        Range: results.solutions?.[0]?.range.unit,
                        ScopeAdjustment: results.solutions?.[0]?.verticalAdjustment.unit,
                        BulletVelocity: results.solutions?.[0]?.velocity.unit,
                        BulletEnergy: results.solutions?.[0]?.energy.unit,
                        TimeOfFlight: 'SECONDS'
                      }}
                    />
                  </CardContent>
                </Card>
              </Box>
            )}
      </form>
    </Container>
  );
};

export default CalculatorPage;
