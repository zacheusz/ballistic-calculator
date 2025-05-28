import React, { useState, useEffect, useRef, useMemo, useReducer, RefObject } from 'react';
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
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import { useBallistics } from '../hooks/useBallistics';
// Import services with proper TypeScript typing
import apiModule from '../services/api.ts';
import configServiceModule from '../services/configService';
// Now both modules have proper TypeScript definitions

// Import components with type assertions for JSX components
// These are still in JSX format and will be converted to TSX in future improvements
import BallisticsResultsGridModule from '../components/BallisticsResultsGrid';
import AtmosphereComponentModule from '../components/AtmosphereComponent';
import ShotComponentModule from '../components/ShotComponent';
import ModeComponentModule from '../components/ModeComponent';

// Type assertions for better TypeScript compatibility
const api = apiModule as any;
const configService = configServiceModule as any;
const BallisticsResultsGrid = BallisticsResultsGridModule as React.FC<any>;
const AtmosphereComponent = AtmosphereComponentModule as React.FC<any>;
const ShotComponent = ShotComponentModule as React.FC<any>;
const ModeComponent = ModeComponentModule as React.FC<any>;
import { 
  Atmosphere, 
  Shot, 
  Measurement, 
  Unit, 
  Ammo, 
  Preferences, 
  WindSegment,
} from '../types/ballistics';

// Define form values interface
interface FormValues {
  atmosphere: Atmosphere;
  shot: Shot;
}

// Define mode type
type CalculationMode = 'HUD' | 'RANGE_CARD';

// Function to get initial values based on unit preferences
const getInitialAtmosphere = (unitPrefs: Record<string, Unit>): Atmosphere => {
  const defaultAtmosphere = configService.getDefaultAtmosphere();
  return {
    temperature: { ...defaultAtmosphere.temperature, unit: unitPrefs.Temperature || defaultAtmosphere.temperature.unit },
    pressure: { ...defaultAtmosphere.pressure, unit: unitPrefs.AtmosphericPressure || defaultAtmosphere.pressure.unit },
    pressureType: defaultAtmosphere.pressureType,
    humidity: defaultAtmosphere.humidity,
    altitude: { ...defaultAtmosphere.altitude, unit: unitPrefs.Range || defaultAtmosphere.altitude.unit },
  };
};

const getInitialShot = (unitPrefs: Record<string, Unit>): Shot => {
  const defaultShot = configService.getDefaultShot();
  return {
    range: { ...defaultShot.range, unit: unitPrefs.Range || defaultShot.range.unit },
    elevationAngle: defaultShot.elevationAngle,
    powderTemp: { ...defaultShot.powderTemp, unit: unitPrefs.Temperature || defaultShot.powderTemp.unit },
    targetSpeed: { ...defaultShot.targetSpeed, unit: unitPrefs.BulletVelocity || defaultShot.targetSpeed.unit },
    targetAngle: defaultShot.targetAngle,
    azimuth: defaultShot.azimuth,
    latitude: defaultShot.latitude,
    windSegments: defaultShot.windSegments.map((segment: any) => ({
      maxRange: { ...segment.maxRange, unit: unitPrefs.Range || segment.maxRange.unit },
      speed: { ...segment.speed, unit: unitPrefs.WindSpeed || segment.speed.unit },
      direction: { ...segment.direction, unit: unitPrefs.WindDirection || segment.direction.unit },
      verticalComponent: { ...segment.verticalComponent, unit: unitPrefs.WindSpeed || segment.verticalComponent.unit },
    })),
  };
};

const validationSchema = Yup.object({
  shot: Yup.object({
    range: Yup.object({
      value: Yup.number().required('Range is required'),
    }),
  }),
});

// Define result interface
interface BallisticSolution {
  range: Measurement;
  verticalAdjustment: Measurement;
  horizontalAdjustment: Measurement;
  drop: Measurement;
  wind: Measurement;
  velocity: Measurement;
  energy: Measurement;
  time: number;
  mach: number;
  spinDrift: Measurement;
  coroDrift: Measurement;
  lead: Measurement;
  aeroJump: Measurement;
}

interface BallisticsResults {
  solutions: BallisticSolution[];
}

const CalculatorPage: React.FC = () => {
  const { t } = useTranslation();
  // Navigation removed as it's not used in this component
  
  // Create refs for input fields to position tooltips
  const temperatureInputRef = useRef<HTMLInputElement | null>(null);
  const pressureInputRef = useRef<HTMLInputElement | null>(null);
  const altitudeInputRef = useRef<HTMLInputElement | null>(null);
  const rangeInputRef = useRef<HTMLInputElement | null>(null);
  const elevationAngleInputRef = useRef<HTMLInputElement | null>(null);
  
  // Create refs for wind segment fields
  const windSegmentRefs = useRef<Record<string, RefObject<HTMLInputElement | null>>>({});
  
  // Helper function to get or create a ref for a wind segment field
  const getWindSegmentRef = (index: number, field: string): RefObject<HTMLInputElement | null> => {
    const key = `wind_${index}_${field}`;
    if (!windSegmentRefs.current[key]) {
      windSegmentRefs.current[key] = React.createRef<HTMLInputElement | null>();
    }
    return windSegmentRefs.current[key];
  };

  // Get API key from Zustand store to determine if configured
  const apiKey = useAppConfigStore(state => state.apiKey);
  // Derive isConfigured from apiKey presence
  const isConfigured = !!apiKey;
  
  const { 
    firearmProfile,
    ammo,
    preferences
  } = useBallistics();
  
  // Add local loading state
  const [loading, setLoading] = useState<boolean>(false);
  
  // Extract calculation options and unit preferences from the preferences object
  const calculationOptions = useMemo(() => preferences || {}, [preferences]);
  const unitPreferences = preferences?.unitPreferences?.unitMappings?.reduce<Record<string, Unit>>((acc, mapping) => {
    acc[mapping.unitTypeClassName] = mapping.unitName;
    return acc;
  }, {}) || {};
  const [results, setResults] = useState<BallisticsResults | null>(null);
  const [error, setError] = useState<string>('');
  const [atmosphere, setAtmosphere] = useState<Atmosphere>(getInitialAtmosphere(unitPreferences));
  const [shot, setShot] = useState<Shot>(getInitialShot(unitPreferences));

  // Define state interfaces and reducer for calculation mode state
  interface ModeState {
    mode: CalculationMode;
    rangeCardStart: number;
    rangeCardStep: number;
    rangeCardUnit: Unit;
  }
  
  type ModeAction = 
    | { type: 'SET_MODE'; payload: CalculationMode }
    | { type: 'SET_RANGE_CARD_START'; payload: number }
    | { type: 'SET_RANGE_CARD_STEP'; payload: number }
    | { type: 'SET_RANGE_CARD_UNIT'; payload: Unit }
    | { type: 'RESET_RANGE_CARD_VALUES'; payload: { start: number; step: number; unit: Unit } };
  
  const defaultCalculationOptions = configService.getDefaultCalculationOptions();
  
  const modeReducer = (state: ModeState, action: ModeAction): ModeState => {
    switch (action.type) {
      case 'SET_MODE':
        return { ...state, mode: action.payload };
      case 'SET_RANGE_CARD_START':
        return { ...state, rangeCardStart: action.payload };
      case 'SET_RANGE_CARD_STEP':
        return { ...state, rangeCardStep: action.payload };
      case 'SET_RANGE_CARD_UNIT':
        return { ...state, rangeCardUnit: action.payload };
      case 'RESET_RANGE_CARD_VALUES':
        return { 
          ...state, 
          rangeCardStart: action.payload.start,
          rangeCardStep: action.payload.step,
          rangeCardUnit: action.payload.unit
        };
      default:
        return state;
    }
  };
  
  const initialModeState: ModeState = {
    mode: 'HUD',
    rangeCardStart: defaultCalculationOptions.rangeCardStart?.value || 100,
    rangeCardStep: defaultCalculationOptions.rangeCardStep?.value || 100,
    rangeCardUnit: defaultCalculationOptions.rangeCardStart?.unit || 'YARDS'
  };
  
  const [modeState, dispatchModeAction] = useReducer(modeReducer, initialModeState);
  const { mode, rangeCardStart, rangeCardStep, rangeCardUnit } = modeState;

  // Reset Range Card fields to defaults when switching to RANGE_CARD mode
  useEffect(() => {
    if (mode === 'RANGE_CARD') {
      dispatchModeAction({
        type: 'RESET_RANGE_CARD_VALUES',
        payload: {
          start: defaultCalculationOptions.rangeCardStart?.value || 100,
          step: defaultCalculationOptions.rangeCardStep?.value || 100,
          unit: defaultCalculationOptions.rangeCardStart?.unit || 'YARDS'
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Update units when unit preferences change - only run once on initial mount
  useEffect(() => {
    // Only update if we have valid unit preferences and atmosphere/shot data
    if (unitPreferences && Object.keys(unitPreferences).length > 0 && 
        atmosphere && atmosphere.temperature && 
        shot && shot.range) {
      
      // Update local atmosphere state instead of using updateAtmosphere
      setAtmosphere(prev => ({
        ...prev,
        temperature: { ...prev.temperature, unit: unitPreferences.Temperature || prev.temperature.unit },
        pressure: { ...prev.pressure, unit: unitPreferences.AtmosphericPressure || prev.pressure.unit },
        altitude: { ...prev.altitude, unit: unitPreferences.Range || prev.altitude.unit }
      }));
      
      // Update local shot state instead of using updateShot
      setShot(prev => ({
        ...prev,
        range: { ...prev.range, unit: unitPreferences.Range || prev.range.unit },
        windSegments: prev.windSegments.map(segment => ({
          ...segment,
          maxRange: { ...segment.maxRange, unit: unitPreferences.Range || segment.maxRange.unit },
          speed: { ...segment.speed, unit: unitPreferences.WindSpeed || segment.speed.unit },
          direction: { ...segment.direction, unit: unitPreferences.WindDirection || segment.direction.unit },
          verticalComponent: { ...segment.verticalComponent, unit: unitPreferences.WindSpeed || segment.verticalComponent.unit }
        }))
      }));
    }
    // Only run this effect once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Define a proper function signature for form submission
const handleFormSubmit = async (values: FormValues): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      // Ensure ammo has required fields
      const processedAmmo: Ammo = { ...ammo };
      
      // Ensure bullet length is properly set and not zero for all drag models
      if (!processedAmmo.length || processedAmmo.length.value <= 0) {
        processedAmmo.length = { value: 1.305, unit: 'INCHES' };
      }
      
      // Ensure ballistic coefficient is set for G1/G7 drag models
      if ((processedAmmo.dragModel === 'G1' || processedAmmo.dragModel === 'G7') && 
          (!processedAmmo.ballisticCoefficients || processedAmmo.ballisticCoefficients.length === 0)) {
        processedAmmo.ballisticCoefficients = [{
          value: processedAmmo.dragModel === 'G1' ? 0.465 : 0.223,
          dragModel: processedAmmo.dragModel
        }];
      }
      
      // Construct the request with values from context and form
      const preferences: Preferences = {
        ...calculationOptions,
        unitPreferences: api.getUnitPreferencesForApi(),
      };
      if (mode === 'RANGE_CARD') {
        preferences.rangeCardStart = { value: Number(rangeCardStart), unit: rangeCardUnit };
        preferences.rangeCardStep = { value: Number(rangeCardStep), unit: rangeCardUnit };
      } else {
        preferences.rangeCardStart = undefined as any;
        preferences.rangeCardStep = undefined as any;
      }
      // Prepare shot data and preferences, ensuring Coriolis effect settings are consistent
      const shotData: Shot = { ...values.shot };
      
      // Create a copy of the preferences to avoid modifying the original calculationOptions
      const updatedPreferences: Preferences = {
        ...preferences,
        // Ensure calculateCoriolisEffect flag is explicitly set to match the context setting
        calculateCoriolisEffect: calculationOptions.calculateCoriolisEffect
      };
      
      if (!calculationOptions.calculateCoriolisEffect) {
        // If Coriolis effect is disabled, set azimuth and latitude to zero
        // This ensures the API doesn't calculate Coriolis effect even if fields exist
        shotData.azimuth = { value: 0, unit: 'DEGREES' };
        shotData.latitude = { value: 0, unit: 'DEGREES' };
      }
      
      const request = {
        firearmProfile,
        ammo: processedAmmo,
        atmosphere: values.atmosphere,
        shot: shotData,
        preferences: updatedPreferences,
      };
      
      const response = await api.computeBallisticSolution(request);
      setResults(response);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.response?.data?.error || 'Error computing ballistic solution');
    } finally {
      setLoading(false);
    }
  };

  // Updated to only accept field name and measurement object
  const handleAtmosphereChange = (field: keyof Atmosphere, measurement: Measurement): void => {
    setAtmosphere(prev => ({
      ...prev,
      [field]: measurement
    }));
  };
  
  // New helper for non-measurement fields (pressureType, humidity)
  const handleAtmosphereSimpleChange = (field: keyof Atmosphere, value: any): void => {
    setAtmosphere(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Define a type for wind segment fields to avoid string indexing issues
type WindSegmentField = keyof Pick<WindSegment, 'maxRange' | 'speed' | 'direction' | 'verticalComponent'>;

const handleShotChange = (field: string, value: any): void => {
    setShot(prev => {
      const newShot = { ...prev };
      const fieldParts = field.split('.');
      
      if (fieldParts.length === 1) {
        (newShot as any)[field] = value;
      } else if (fieldParts.length === 2) {
        (newShot as any)[fieldParts[0]][fieldParts[1]] = value;
      } else if (fieldParts.length === 3 && fieldParts[0] === 'windSegments') {
        // Handle array access for wind segments
        const index = parseInt(fieldParts[1], 10);
        if (!newShot.windSegments[index]) {
          newShot.windSegments[index] = { 
            maxRange: { value: 1000, unit: 'YARDS' },
            speed: { value: 0, unit: 'MILES_PER_HOUR' },
            direction: { value: 3, unit: 'CLOCK' },
            verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' }
          };
        }
        // Use the field part as a key with proper type checking
        const segmentField = fieldParts[2] as WindSegmentField;
        // Use proper typing for the wind segment field with type assertion
        if (segmentField === 'maxRange' || segmentField === 'speed' || 
            segmentField === 'direction' || segmentField === 'verticalComponent') {
          (newShot.windSegments[index] as any)[segmentField] = value;
        }
      } else if (fieldParts.length === 4 && fieldParts[0] === 'windSegments') {
        // Handle nested object in wind segments
        const index = parseInt(fieldParts[1], 10);
        if (!newShot.windSegments[index]) {
          newShot.windSegments[index] = { 
            maxRange: { value: 1000, unit: 'YARDS' },
            speed: { value: 0, unit: 'MILES_PER_HOUR' },
            direction: { value: 3, unit: 'CLOCK' },
            verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' }
          };
        }
        // Use the field part as a key with proper type checking
        const segmentField = fieldParts[2] as WindSegmentField;
        const measurementField = fieldParts[3] as 'value' | 'unit';
        if (newShot.windSegments[index] && newShot.windSegments[index][segmentField]) {
          const measurement = newShot.windSegments[index][segmentField] as Measurement;
          if (measurement) {
            measurement[measurementField] = value;
          }
        }
      }
      
      return newShot;
    });
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h4" align="center" sx={{ mb: 4 }}>
        {t('calcTitle')}
      </Typography>

      {!isConfigured && (
        <Alert 
          severity="warning" 
          variant="outlined"
          sx={{ mb: 2 }}
        >
          {t('calcConfigAlert')}
        </Alert>
      )}

      <Alert 
        severity="info" 
        variant="outlined"
        sx={{ mb: 4 }}
      >
        <Typography component="span">
          <strong>{t('calcNote')}:</strong> {t('calcNoteText')}{' '}
          <Link to="/config">
            {t('calcConfigPageLink')}
          </Link>.
        </Typography>
      </Alert>

      <Formik
        initialValues={{ atmosphere, shot }}
        validationSchema={validationSchema}
        onSubmit={handleFormSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
          <FormikForm>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Two-column layout container for desktop */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Left column for Atmosphere and Mode components */}
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <AtmosphereComponent
                    values={values}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    handleAtmosphereChange={handleAtmosphereChange}
                    handleAtmosphereSimpleChange={handleAtmosphereSimpleChange}
                    loading={loading}
                    temperatureInputRef={temperatureInputRef}
                    pressureInputRef={pressureInputRef}
                    altitudeInputRef={altitudeInputRef}
                  />

                  <ModeComponent
                    mode={mode}
                    onModeChange={(newMode: CalculationMode) => dispatchModeAction({ type: 'SET_MODE', payload: newMode })}
                    rangeCardStart={rangeCardStart}
                    onRangeCardStartChange={(value: number) => dispatchModeAction({ type: 'SET_RANGE_CARD_START', payload: value })}
                    rangeCardStep={rangeCardStep}
                    onRangeCardStepChange={(value: number) => dispatchModeAction({ type: 'SET_RANGE_CARD_STEP', payload: value })}
                    unit={rangeCardUnit}
                    onUnitChange={(unit: Unit) => dispatchModeAction({ type: 'SET_RANGE_CARD_UNIT', payload: unit })}
                  />
                </Box>
                
                {/* Right column for Shot component */}
                <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                  <ShotComponent
                    values={values}
                    handleBlur={handleBlur}
                    handleShotChange={handleShotChange}
                    setFieldValue={setFieldValue}
                    loading={loading}
                    errors={errors}
                    touched={touched}
                    calculationOptions={calculationOptions}
                    rangeInputRef={rangeInputRef}
                    elevationAngleInputRef={elevationAngleInputRef}
                    getWindSegmentRef={getWindSegmentRef}
                  />
                </Box>
              </Box>
              
              {/* Full width for the Calculate button */}
              <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isSubmitting || !isConfigured || loading}
                  title={!isConfigured ? t('pleaseConfigureApiKey') : ''}
                  onClick={() => {
                    // Update the form values with the current state before submission
                    const updatedValues: FormValues = {
                      atmosphere,
                      shot
                    };
                    handleFormSubmit(updatedValues);
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      {t('calcComputing')}
                    </>
                  ) : t('calcCalculateBallistics')}
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  {t('settingsAutoSaved')}
                </Typography>
              </Box>
            </Box>
          </FormikForm>
        )}
      </Formik>

      {error && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            <AlertTitle>{t('error')}</AlertTitle>
            {error}
          </Alert>
        </Box>
      )}

      {results && results.solutions && results.solutions.length > 0 && (
        <Box sx={{ mt: 4 }} id="results">
          <Card>
            <CardHeader title={t('calcBallisticSolution')} />
            <CardContent>
              {/* MUI X Data Grid View */}
              <BallisticsResultsGrid 
                results={results.solutions.map(solution => ({
                  range: solution.range.value,
                  verticalAdjustment: solution.verticalAdjustment.value,
                  horizontalAdjustment: solution.horizontalAdjustment.value,
                  drop: solution.drop.value,
                  wind: solution.wind.value,
                  velocity: solution.velocity.value,
                  energy: solution.energy.value,
                  time: solution.time,
                  mach: solution.mach,
                  spinDrift: solution.spinDrift.value,
                  coroDrift: solution.coroDrift.value,
                  lead: solution.lead.value,
                  aeroJump: solution.aeroJump.value
                }))}
                unitPreferences={{
                  Range: results.solutions[0]?.range.unit,
                  ScopeAdjustment: results.solutions[0]?.verticalAdjustment.unit,
                  BulletVelocity: results.solutions[0]?.velocity.unit,
                  BulletEnergy: results.solutions[0]?.energy.unit,
                  TimeOfFlight: 'SECONDS'
                }}
              />
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
};

export default CalculatorPage;
