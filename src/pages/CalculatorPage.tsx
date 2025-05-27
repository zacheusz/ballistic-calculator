import React, { useState, useEffect, useRef, useMemo, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Grid, 
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
import { Formik, Form as FormikForm, FormikHelpers, FormikErrors, FormikTouched } from 'formik';
import * as Yup from 'yup';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import { useBallistics } from '../hooks/useBallistics';
import api from '../services/api';
import configService from '../services/configService';
import { STORAGE_KEYS } from '../services/storageService';
import ClockTimePicker from '../components/ClockTimePicker';
import BallisticsResultsGrid from '../components/BallisticsResultsGrid';
import UnitSelectorWithConversion from '../components/UnitSelectorWithConversion';
// Import new components
import AtmosphereComponent from '../components/AtmosphereComponent';
import ShotComponent from '../components/ShotComponent';
import ModeComponent from '../components/ModeComponent';
import { 
  Atmosphere, 
  Shot, 
  Measurement, 
  Unit, 
  Ammo, 
  FirearmProfile, 
  Preferences, 
  WindSegment 
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
    windSegments: defaultShot.windSegments.map(segment => ({
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
  // We're not using navigation in this component, but keeping the hook for future use
  const navigate = useNavigate();
  
  // Create refs for input fields to position tooltips
  const temperatureInputRef = useRef<HTMLInputElement | null>(null);
  const pressureInputRef = useRef<HTMLInputElement | null>(null);
  const altitudeInputRef = useRef<HTMLInputElement | null>(null);
  const rangeInputRef = useRef<HTMLInputElement | null>(null);
  const elevationAngleInputRef = useRef<HTMLInputElement | null>(null);
  
  // Create refs for wind segment fields
  const windSegmentRefs = useRef<Record<string, RefObject<HTMLInputElement>>>({});
  
  // Helper function to get or create a ref for a wind segment field
  const getWindSegmentRef = (index: number, field: string): RefObject<HTMLInputElement> => {
    const key = `wind_${index}_${field}`;
    if (!windSegmentRefs.current[key]) {
      windSegmentRefs.current[key] = React.createRef<HTMLInputElement>();
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

  // HUD/Range Card mode state
  const defaultCalculationOptions = configService.getDefaultCalculationOptions();
  const [mode, setMode] = useState<CalculationMode>('HUD');
  const [rangeCardStart, setRangeCardStart] = useState<number>(
    defaultCalculationOptions.rangeCardStart?.value || 100
  );
  const [rangeCardStep, setRangeCardStep] = useState<number>(
    defaultCalculationOptions.rangeCardStep?.value || 100
  );
  const [rangeCardUnit, setRangeCardUnit] = useState<Unit>(
    defaultCalculationOptions.rangeCardStart?.unit || 'YARDS'
  );

  // Reset Range Card fields to defaults when switching to RANGE_CARD mode
  useEffect(() => {
    if (mode === 'RANGE_CARD') {
      setRangeCardStart(defaultCalculationOptions.rangeCardStart?.value || 100);
      setRangeCardStep(defaultCalculationOptions.rangeCardStep?.value || 100);
      setRangeCardUnit(defaultCalculationOptions.rangeCardStart?.unit || 'YARDS');
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

  const handleSubmit = async (values: FormValues): Promise<void> => {
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
        (newShot.windSegments[index] as any)[fieldParts[2]] = value;
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
        (newShot.windSegments[index][fieldParts[2]] as any)[fieldParts[3]] = value;
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
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>{t('warning')}</AlertTitle>
          {t('calcConfigAlert')}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 4 }}>
        <AlertTitle>{t('info')}</AlertTitle>
        <Typography component="span">
          <strong>{t('calcNote')}:</strong> {t('calcNoteText')}{' '}
          <Link to="/config">{t('calcConfigPageLink')}</Link>.
        </Typography>
      </Alert>

      <Formik
        initialValues={{ atmosphere, shot }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
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
                    onModeChange={setMode}
                    rangeCardStart={rangeCardStart}
                    onRangeCardStartChange={setRangeCardStart}
                    rangeCardStep={rangeCardStep}
                    onRangeCardStepChange={setRangeCardStep}
                    unit={rangeCardUnit}
                    onUnitChange={setRangeCardUnit}
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
                    const updatedValues = {
                      atmosphere,
                      shot
                    };
                    handleSubmit(updatedValues);
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                      {t('calcComputing')}
                    </>
                  ) : t('calcCalculateBallistics')}
                </Button>
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
