import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import { useBallistics } from '../hooks/useBallistics';
import api from '../services/api';
import configService from '../services/configService';
import { STORAGE_KEYS } from '../services/storageService';
import ClockTimePicker from '../components/ClockTimePicker.tsx';
import BallisticsResultsGrid from '../components/BallisticsResultsGrid';
import UnitSelectorWithConversion from '../components/UnitSelectorWithConversion.tsx';
// Import new components
import AtmosphereComponent from '../components/AtmosphereComponent';
import ShotComponent from '../components/ShotComponent';
import ModeComponent from '../components/ModeComponent';

// Function to get initial values based on unit preferences
const getInitialAtmosphere = (unitPrefs) => {
  const defaultAtmosphere = configService.getDefaultAtmosphere();
  return {
    temperature: { ...defaultAtmosphere.temperature, unit: unitPrefs.Temperature || defaultAtmosphere.temperature.unit },
    pressure: { ...defaultAtmosphere.pressure, unit: unitPrefs.AtmosphericPressure || defaultAtmosphere.pressure.unit },
    pressureType: defaultAtmosphere.pressureType,
    humidity: defaultAtmosphere.humidity,
    altitude: { ...defaultAtmosphere.altitude, unit: unitPrefs.Range || defaultAtmosphere.altitude.unit },
  };
};

const getInitialShot = (unitPrefs) => {
  const defaultShot = configService.getDefaultShot();
  return {
    range: { ...defaultShot.range, unit: unitPrefs.Range || defaultShot.range.unit },
    targetDistance: { value: defaultShot.range.value, unit: unitPrefs.Range || defaultShot.range.unit },
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

const CalculatorPage = () => {
  const { t } = useTranslation();
  // We're not using navigation in this component, but keeping the hook for future use
  const _navigate = useNavigate();
  
  // Create refs for input fields to position tooltips
  const temperatureInputRef = useRef(null);
  const pressureInputRef = useRef(null);
  const altitudeInputRef = useRef(null);
  const rangeInputRef = useRef(null);
  const elevationAngleInputRef = useRef(null);
  // These refs are defined but not currently used - keeping them for future use
  const _windSpeedInputRef = useRef(null);
  const _windAngleInputRef = useRef(null);
  
  // Create refs for wind segment fields
  const windSegmentRefs = useRef({});
  
  // Helper function to get or create a ref for a wind segment field
  const getWindSegmentRef = (index, field) => {
    const key = `wind_${index}_${field}`;
    if (!windSegmentRefs.current[key]) {
      windSegmentRefs.current[key] = React.createRef();
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
  const [loading, setLoading] = useState(false);
  
  // Extract calculation options and unit preferences from the preferences object
  const calculationOptions = useMemo(() => preferences || {}, [preferences]);
  const unitPreferences = preferences?.unitPreferences?.unitMappings?.reduce((acc, mapping) => {
    acc[mapping.unitTypeClassName] = mapping.unitName;
    return acc;
  }, {}) || {};
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [atmosphere, setAtmosphere] = useState(getInitialAtmosphere(unitPreferences));
  const [shot, setShot] = useState(getInitialShot(unitPreferences));

  // HUD/Range Card mode state
  const defaultCalculationOptions = configService.getDefaultCalculationOptions();
  const [mode, setMode] = useState('HUD');
  const [rangeCardStart, setRangeCardStart] = useState(defaultCalculationOptions.rangeCardStart?.value || 100);
  const [rangeCardStep, setRangeCardStep] = useState(defaultCalculationOptions.rangeCardStep?.value || 100);
  const [rangeCardUnit, setRangeCardUnit] = useState(defaultCalculationOptions.rangeCardStart?.unit || 'YARDS');

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
  
  // Log initial calculation options from localStorage
  useEffect(() => {
    // Check localStorage directly to see what's stored there
    const savedOptions = localStorage.getItem('snipe_ballistics_calculation_options');
    if (savedOptions) {
      const parsedOptions = JSON.parse(savedOptions);
      console.log('Initial calculation options in localStorage:', parsedOptions);
      console.log('Initial Coriolis effect in localStorage:', parsedOptions.calculateCoriolisEffect);
    } else {
      console.log('No calculation options found in localStorage');
    }
  }, []); // Empty dependency array means this runs once on mount
  
  // Log calculation options for debugging
  useEffect(() => {
    console.log('Calculation options updated:', calculationOptions);
    
    // Check localStorage directly to see what's stored there
    const savedOptions = localStorage.getItem('snipe_ballistics_calculation_options');
    if (savedOptions) {
      const parsedOptions = JSON.parse(savedOptions);
      console.log('Calculation options in localStorage:', parsedOptions);
      console.log('Coriolis effect in localStorage:', parsedOptions.calculateCoriolisEffect);
    } else {
      console.log('No calculation options found in localStorage');
    }
  }, [calculationOptions]);

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    try {
      // Ensure ammo has required fields
      const processedAmmo = { ...ammo };
      
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
      const preferences = {
        ...calculationOptions,
        unitPreferences: api.getUnitPreferencesForApi(),
      };
      if (mode === 'RANGE_CARD') {
        preferences.rangeCardStart = { value: Number(rangeCardStart), unit: rangeCardUnit };
        preferences.rangeCardStep = { value: Number(rangeCardStep), unit: rangeCardUnit };
      } else {
        preferences.rangeCardStart = undefined;
        preferences.rangeCardStep = undefined;
      }
      // Prepare shot data and preferences, ensuring Coriolis effect settings are consistent
      const shotData = { ...values.shot };
      
      // Create a copy of the preferences to avoid modifying the original calculationOptions
      const updatedPreferences = {
        ...preferences,
        // Ensure calculateCoriolisEffect flag is explicitly set to match the context setting
        calculateCoriolisEffect: calculationOptions.calculateCoriolisEffect
      };
      
      if (!calculationOptions.calculateCoriolisEffect) {
        // If Coriolis effect is disabled, set azimuth and latitude to zero
        // This ensures the API doesn't calculate Coriolis effect even if fields exist
        shotData.azimuth = { value: 0, unit: 'DEGREES' };
        shotData.latitude = { value: 0, unit: 'DEGREES' };
        console.log('%c 🌍 Coriolis Effect Disabled', 'font-weight: bold; color: #ff6b6b;', { 
          coriolisEnabled: updatedPreferences.calculateCoriolisEffect,
          azimuth: shotData.azimuth,
          latitude: shotData.latitude
        });
      } else {
        console.log('%c 🌍 Coriolis Effect Enabled', 'font-weight: bold; color: #51cf66;', { 
          coriolisEnabled: updatedPreferences.calculateCoriolisEffect,
          azimuth: shotData.azimuth,
          latitude: shotData.latitude
        });
      }
      
      const request = {
        firearmProfile,
        ammo: processedAmmo,
        atmosphere: values.atmosphere,
        shot: shotData,
        preferences: updatedPreferences,
      };
      
      // Create a deep copy of the request object to ensure accurate logging
      const requestCopy = JSON.parse(JSON.stringify(request));
      
      // Use a timestamp to distinguish between different API calls
      const timestamp = new Date().toISOString();
      
      // Log the request with timestamp and distinctive formatting
      console.log('%c ⚡ Ballistics API Request (' + timestamp + ')', 'font-weight: bold; font-size: 14px; color: #0066cc; background: #f0f8ff; padding: 3px 5px; border-radius: 3px;', requestCopy);
      
      const response = await api.computeBallisticSolution(request);
      setResults(response);
    } catch (err) {
      console.error('API Error:', err);
      setError(err.response?.data?.error || 'Error computing ballistic solution');
    } finally {
      setLoading(false);
    }
  };

  
  // Updated to only accept field name and measurement object
  const handleAtmosphereChange = (field, measurement) => {
    setAtmosphere(prev => ({
      ...prev,
      [field]: measurement
    }));
  };
  
  // New helper for non-measurement fields (pressureType, humidity)
  const handleAtmosphereSimpleChange = (field, value) => {
    setAtmosphere(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleShotChange = (field, value) => {
    setShot(prev => {
      const newShot = { ...prev };
      const fieldParts = field.split('.');
      
      if (fieldParts.length === 1) {
        newShot[field] = value;
      } else if (fieldParts.length === 2) {
        newShot[fieldParts[0]][fieldParts[1]] = value;
      } else if (fieldParts.length === 3 && fieldParts[0] === 'windSegments') {
        // Handle array access for wind segments
        if (!newShot.windSegments[parseInt(fieldParts[1])]) {
          newShot.windSegments[parseInt(fieldParts[1])] = { 
            maxRange: { value: 1000, unit: 'YARDS' },
            speed: { value: 0, unit: 'MILES_PER_HOUR' },
            direction: { value: 3, unit: 'CLOCK' },
            verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' }
          };
        }
        newShot.windSegments[parseInt(fieldParts[1])][fieldParts[2]] = value;
      } else if (fieldParts.length === 4 && fieldParts[0] === 'windSegments') {
        // Handle nested object in wind segments
        if (!newShot.windSegments[parseInt(fieldParts[1])]) {
          newShot.windSegments[parseInt(fieldParts[1])] = { 
            maxRange: { value: 1000, unit: 'YARDS' },
            speed: { value: 0, unit: 'MILES_PER_HOUR' },
            direction: { value: 3, unit: 'CLOCK' },
            verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' }
          };
        }
        newShot.windSegments[parseInt(fieldParts[1])][fieldParts[2]][fieldParts[3]] = value;
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
