import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Card, Spinner, Alert, Table, Form } from 'react-bootstrap';
import { Formik, Form as FormikForm } from 'formik';
import * as Yup from 'yup';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import { useBallistics } from '../hooks/useBallistics';
import api from '../services/api';
import configService from '../services/configService';
import { STORAGE_KEYS } from '../services/storageService';
import ClockTimePicker from '../components/ClockTimePicker';
import BallisticsResultsGrid from '../components/BallisticsResultsGrid';
import ModePanel from '../components/ModePanel';
import UnitSelectorWithConversion from '../components/UnitSelectorWithConversion';

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

// Custom UnitSelector component that wraps UnitSelectorWithConversion
const UnitSelector = ({
  fieldName,
  value,
  onChange,
  options,
  currentValue,
  onValueChange,
  targetRef,
  setFieldValue // Add setFieldValue from Formik
}) => (
  <UnitSelectorWithConversion
    fieldName={fieldName}
    value={value}
    onChange={(e) => {
      // Call the original onChange handler
      onChange(e);
    }}
    options={options}
    currentValue={currentValue}
    onValueChange={(newValue) => {
      // Update the value in the state
      onValueChange(newValue);
      
      // Also update the Formik form value
      if (setFieldValue) {
        // Extract the field name from the full path (e.g., 'shot.range.value' from 'shot.range.unit')
        const valuePath = fieldName.replace(/\.unit$/, '.value');
        setFieldValue(valuePath, newValue);
      }
    }}
    targetRef={targetRef}
  />
);

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

  
  const handleAtmosphereChange = (field, value) => {
    setAtmosphere(prev => {
      const newAtmosphere = { ...prev };
      const fieldParts = field.split('.');
      
      if (fieldParts.length === 1) {
        newAtmosphere[field] = value;
      } else if (fieldParts.length === 2) {
        newAtmosphere[fieldParts[0]][fieldParts[1]] = value;
      }
      
      return newAtmosphere;
    });
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
    <Container className="my-4">
      <h1 className="text-center mb-4">{t('calcTitle')}</h1>

      { !isConfigured && (
        <Alert variant="warning">
          {t('calcConfigAlert')}
        </Alert>
      )}

      <Alert variant="info" className="mb-4">
        <strong>{t('calcNote')}:</strong> {t('calcNoteText')} <a href="/config">{t('calcConfigPageLink')}</a>.
      </Alert>

      <Formik
        initialValues={{ atmosphere, shot }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, setFieldValue }) => (
          <FormikForm>
            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header as="h5">{t('calcAtmosphere')}</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('calcTemperature')}</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="atmosphere.temperature.value"
                          value={values.atmosphere.temperature.value}
                          onChange={(e) => {
                            handleChange(e);
                            handleAtmosphereChange('temperature.value', parseFloat(e.target.value));
                          }}
                          onBlur={handleBlur}
                          className="me-2"
                          ref={temperatureInputRef}
                        />
                        <UnitSelector
                          fieldName="atmosphere.temperature.unit"
                          value={values.atmosphere.temperature.unit}
                          onChange={(e) => {
                            handleChange(e);
                            handleAtmosphereChange('temperature.unit', e.target.value);
                          }}
                          options={[
                            { value: 'FAHRENHEIT', label: t('unitFahrenheit') },
                            { value: 'CELSIUS', label: t('unitCelsius') },
                            { value: 'KELVIN', label: t('unitKelvin') }
                          ]}
                          currentValue={values.atmosphere.temperature.value}
                          onValueChange={(newValue) => handleAtmosphereChange('temperature.value', newValue)}
                          targetRef={temperatureInputRef}
                          setFieldValue={setFieldValue}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('calcPressure')}</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          step="0.01"
                          name="atmosphere.pressure.value"
                          value={values.atmosphere.pressure.value}
                          onChange={(e) => {
                            handleChange(e);
                            handleAtmosphereChange('pressure.value', parseFloat(e.target.value));
                          }}
                          onBlur={handleBlur}
                          className="me-2"
                          ref={pressureInputRef}
                        />
                        <UnitSelector
                          fieldName="atmosphere.pressure.unit"
                          value={values.atmosphere.pressure.unit}
                          onChange={(e) => {
                            handleChange(e);
                            handleAtmosphereChange('pressure.unit', e.target.value);
                          }}
                          options={[
                            { value: 'INHG', label: t('unitInHg') },
                            { value: 'MMHG', label: t('unitMmHg') },
                            { value: 'HPASCAL', label: t('unitHPa') },
                            { value: 'MBAR', label: t('unitMbar') }
                          ]}
                          currentValue={values.atmosphere.pressure.value}
                          onValueChange={(newValue) => handleAtmosphereChange('pressure.value', newValue)}
                          targetRef={pressureInputRef}
                          setFieldValue={setFieldValue}
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('calcPressureType')}</Form.Label>
                      <Form.Select
                        name="atmosphere.pressureType"
                        value={values.atmosphere.pressureType}
                        onChange={(e) => {
                          handleChange(e);
                          handleAtmosphereChange('pressureType', e.target.value);
                        }}
                        onBlur={handleBlur}
                      >
                        <option value="STATION">{t('calcStationPressure')}</option>
                        <option value="BAROMETRIC">{t('calcBarometricPressure')}</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('calcHumidity')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        max="100"
                        name="atmosphere.humidity"
                        value={values.atmosphere.humidity}
                        onChange={(e) => {
                          handleChange(e);
                          handleAtmosphereChange('humidity', parseFloat(e.target.value));
                        }}
                        onBlur={handleBlur}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('calcAltitude')}</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="atmosphere.altitude.value"
                          value={values.atmosphere.altitude.value}
                          onChange={(e) => {
                            handleChange(e);
                            handleAtmosphereChange('altitude.value', parseFloat(e.target.value));
                          }}
                          onBlur={handleBlur}
                          className="me-2"
                          ref={altitudeInputRef}
                        />
                        <UnitSelector
                          fieldName="atmosphere.altitude.unit"
                          value={values.atmosphere.altitude.unit}
                          onChange={(e) => {
                            handleChange(e);
                            handleAtmosphereChange('altitude.unit', e.target.value);
                          }}
                          options={[
                            { value: 'FEET', label: t('unitFeet') },
                            { value: 'METERS', label: t('unitMeters') },
                            { value: 'YARDS', label: t('unitYards') }
                          ]}
                          currentValue={values.atmosphere.altitude.value}
                          onValueChange={(newValue) => handleAtmosphereChange('altitude.value', newValue)}
                          targetRef={altitudeInputRef}
                          setFieldValue={setFieldValue}
                        />
                      </div>
                    </Form.Group>
                  </Card.Body>
                </Card>

                <ModePanel
                  mode={mode}
                  onModeChange={setMode}
                  rangeCardStart={rangeCardStart}
                  onRangeCardStartChange={setRangeCardStart}
                  rangeCardStep={rangeCardStep}
                  onRangeCardStepChange={setRangeCardStep}
                  unit={rangeCardUnit}
                  onUnitChange={setRangeCardUnit}
                />
              </Col>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Header as="h5">{t('calcShot')}</Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>{t('calcRange')}</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="shot.range.value"
                          value={values.shot.range.value}
                          onChange={(e) => {
                            handleChange(e);
                            handleShotChange('range.value', parseFloat(e.target.value));
                          }}
                          onBlur={handleBlur}
                          isInvalid={touched.shot?.range?.value && errors.shot?.range?.value}
                          className="me-2"
                          ref={rangeInputRef}
                        />
                        <UnitSelector
                          fieldName="shot.range.unit"
                          value={values.shot.range.unit}
                          onChange={(e) => {
                            handleChange(e);
                            handleShotChange('range.unit', e.target.value);
                          }}
                          options={[
                            { value: 'YARDS', label: t('unitYards') },
                            { value: 'METERS', label: t('unitMeters') },
                            { value: 'FEET', label: t('unitFeet') }
                          ]}
                          currentValue={values.shot.range.value}
                          onValueChange={(newValue) => handleShotChange('range.value', newValue)}
                          targetRef={rangeInputRef}
                          setFieldValue={setFieldValue}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.shot?.range?.value}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('calcElevationAngle')}</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="number"
                          name="shot.elevationAngle.value"
                          value={values.shot.elevationAngle.value}
                          onChange={(e) => {
                            handleChange(e);
                            handleShotChange('elevationAngle.value', parseFloat(e.target.value));
                          }}
                          onBlur={handleBlur}
                          className="me-2"
                          ref={elevationAngleInputRef}
                        />
                        <UnitSelector
                          fieldName="shot.elevationAngle.unit"
                          value={values.shot.elevationAngle.unit}
                          onChange={(e) => {
                            handleChange(e);
                            handleShotChange('elevationAngle.unit', e.target.value);
                          }}
                          options={[
                            { value: 'DEGREES', label: t('unitDegrees') },
                            { value: 'MILS', label: t('unitMils') },
                            { value: 'MOA', label: t('unitMoa') }
                          ]}
                          currentValue={values.shot.elevationAngle.value}
                          onValueChange={(newValue) => handleShotChange('elevationAngle.value', newValue)}
                          targetRef={elevationAngleInputRef}
                          setFieldValue={setFieldValue}
                        />
                      </div>
                    </Form.Group>

                    {/* Only show Coriolis effect fields when the feature is enabled */}
                    {calculationOptions?.calculateCoriolisEffect === true && (
                      <>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('shotAzimuth')}</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="number"
                              name="shot.azimuth.value"
                              value={values.shot.azimuth.value}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange('azimuth.value', parseFloat(e.target.value));
                              }}
                              onBlur={handleBlur}
                              className="me-2"
                            />
                            <UnitSelector
                              fieldName="shot.azimuth.unit"
                              value={values.shot.azimuth.unit}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange('azimuth.unit', e.target.value);
                              }}
                              options={[
                                { value: 'DEGREES', label: t('unitDegrees') }
                              ]}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>{t('shooterLatitude')}</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="number"
                              name="shot.latitude.value"
                              value={values.shot.latitude.value}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange('latitude.value', parseFloat(e.target.value));
                              }}
                              onBlur={handleBlur}
                              className="me-2"
                            />
                            <UnitSelector
                              fieldName="shot.latitude.unit"
                              value={values.shot.latitude.unit}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange('latitude.unit', e.target.value);
                              }}
                              options={[
                                { value: 'DEGREES', label: t('unitDegrees') }
                              ]}
                            />
                          </div>
                        </Form.Group>
                      </>
                    )}

                    <h6 className="mt-4 mb-3">{t('calcWindSegments')}</h6>
                    {values.shot.windSegments.map((segment, index) => (
                      <div key={index} className="p-3 border rounded mb-3">
                        <h6>{t('calcWindSegment')} {index + 1}</h6>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('calcMaxRange')}</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="number"
                              name={`shot.windSegments[${index}].maxRange.value`}
                              value={segment.maxRange.value}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange(`windSegments.${index}.maxRange.value`, parseFloat(e.target.value));
                              }}
                              onBlur={handleBlur}
                              className="me-2"
                              ref={getWindSegmentRef(index, 'maxRange')}
                            />
                            <UnitSelector
                              fieldName={`shot.windSegments[${index}].maxRange.unit`}
                              value={segment.maxRange.unit}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange(`windSegments.${index}.maxRange.unit`, e.target.value);
                              }}
                              options={[
                                { value: 'YARDS', label: t('unitYards') },
                                { value: 'METERS', label: t('unitMeters') },
                                { value: 'FEET', label: t('unitFeet') }
                              ]}
                              currentValue={segment.maxRange.value}
                              onValueChange={(newValue) => handleShotChange(`windSegments.${index}.maxRange.value`, newValue)}
                              targetRef={getWindSegmentRef(index, 'maxRange')}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>{t('calcWindSpeed')}</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="number"
                              name={`shot.windSegments[${index}].speed.value`}
                              value={segment.speed.value}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange(`windSegments.${index}.speed.value`, parseFloat(e.target.value));
                              }}
                              onBlur={handleBlur}
                              className="me-2"
                              ref={getWindSegmentRef(index, 'speed')}
                            />
                            <UnitSelector
                              fieldName={`shot.windSegments[${index}].speed.unit`}
                              value={segment.speed.unit}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange(`windSegments.${index}.speed.unit`, e.target.value);
                              }}
                              options={[
                                { value: 'MILES_PER_HOUR', label: t('unitMph') },
                                { value: 'KILOMETERS_PER_HOUR', label: t('unitKph') },
                                { value: 'METERS_PER_SECOND', label: t('unitMps') }
                              ]}
                              currentValue={segment.speed.value}
                              onValueChange={(newValue) => handleShotChange(`windSegments.${index}.speed.value`, newValue)}
                              targetRef={getWindSegmentRef(index, 'speed')}
                              setFieldValue={setFieldValue}
                            />
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>{t('calcWindDirection')}</Form.Label>
                          <div className="d-flex align-items-center">
                            {segment.direction.unit === 'CLOCK' ? (
                              <div className="d-flex align-items-center" style={{ width: '100%', overflow: 'hidden' }}>
                                <div style={{ flex: '1', marginRight: '10px', maxWidth: 'calc(100% - 110px)', overflow: 'hidden' }}>
                                  <ClockTimePicker 
                                    value={segment.direction.value} 
                                    onChange={(value) => {
                                      // Only update the clock position value (1-12)
                                      handleShotChange(`windSegments.${index}.direction.value`, value);
                                    }}
                                  />
                                </div>
                                <div style={{ width: '100px', flexShrink: 0 }}>
                                  <UnitSelector
                                    fieldName={`shot.windSegments[${index}].direction.unit`}
                                    value={segment.direction.unit}
                                    onChange={(e) => {
                                      handleChange(e);
                                      handleShotChange(`windSegments.${index}.direction.unit`, e.target.value);
                                    }}
                                    options={[
                                      { value: 'CLOCK', label: t('unitClock') },
                                      { value: 'DEGREES', label: t('unitDegrees') },
                                      { value: 'MILS', label: t('unitMils') },
                                      { value: 'MOA', label: t('unitMoa') }
                                    ]}
                                    currentValue={segment.direction.value}
                                    onValueChange={(newValue) => handleShotChange(`windSegments.${index}.direction.value`, newValue)}
                                    targetRef={getWindSegmentRef(index, 'direction')}
                                    setFieldValue={setFieldValue}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex align-items-center">
                                <Form.Control
                                  type="number"
                                  name={`shot.windSegments[${index}].direction.value`}
                                  value={segment.direction.value}
                                  onChange={(e) => {
                                    handleChange(e);
                                    handleShotChange(`windSegments.${index}.direction.value`, parseFloat(e.target.value));
                                  }}
                                  onBlur={handleBlur}
                                  className="me-2"
                                />
                                <UnitSelector
                                  fieldName={`shot.windSegments[${index}].direction.unit`}
                                  value={segment.direction.unit}
                                  onChange={(e) => {
                                    handleChange(e);
                                    handleShotChange(`windSegments.${index}.direction.unit`, e.target.value);
                                  }}
                                  options={[
                                    { value: 'CLOCK', label: t('unitClock') },
                                    { value: 'DEGREES', label: t('unitDegrees') },
                                    { value: 'MILS', label: t('unitMils') },
                                    { value: 'MOA', label: t('unitMoa') }
                                  ]}
                                  currentValue={segment.direction.value}
                                  onValueChange={(newValue) => handleShotChange(`windSegments.${index}.direction.value`, newValue)}
                                  targetRef={getWindSegmentRef(index, 'direction')}
                                  setFieldValue={setFieldValue}
                                />
                              </div>
                            )}
                          </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label>{t('calcVerticalComponent')}</Form.Label>
                          <div className="d-flex align-items-center">
                            <Form.Control
                              type="number"
                              name={`shot.windSegments[${index}].verticalComponent.value`}
                              value={segment.verticalComponent?.value || 0}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange(`windSegments.${index}.verticalComponent.value`, parseFloat(e.target.value));
                              }}
                              onBlur={handleBlur}
                              className="me-2"
                              ref={getWindSegmentRef(index, 'verticalComponent')}
                            />
                            <UnitSelector
                              fieldName={`shot.windSegments[${index}].verticalComponent.unit`}
                              value={segment.verticalComponent?.unit || segment.speed.unit}
                              onChange={(e) => {
                                handleChange(e);
                                handleShotChange(`windSegments.${index}.verticalComponent.unit`, e.target.value);
                              }}
                              options={[
                                { value: 'MILES_PER_HOUR', label: t('unitMph') },
                                { value: 'KILOMETERS_PER_HOUR', label: t('unitKph') },
                                { value: 'METERS_PER_SECOND', label: t('unitMps') }
                              ]}
                              currentValue={segment.verticalComponent?.value || 0}
                              onValueChange={(newValue) => handleShotChange(`windSegments.${index}.verticalComponent.value`, newValue)}
                              targetRef={getWindSegmentRef(index, 'verticalComponent')}
                            />
                          </div>
                        </Form.Group>

                        {index > 0 && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => {
                              const newWindSegments = [...values.shot.windSegments];
                              newWindSegments.splice(index, 1);
                              handleShotChange('windSegments', newWindSegments);
                            }}
                          >
                            {t('calcRemoveSegment')}
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="mt-2"
                      onClick={() => {
                        const newWindSegments = [...values.shot.windSegments];
                        newWindSegments.push({
                          maxRange: { value: 1000, unit: 'YARDS' },
                          speed: { value: 0, unit: 'MILES_PER_HOUR' },
                          direction: { value: 3, unit: 'CLOCK' },
                          verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' }
                        });
                        handleShotChange('windSegments', newWindSegments);
                      }}
                    >
                      {t('calcAddWindSegment')}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="mt-4 mb-4">
              <Col>
                <Button 
                  type="submit" 
                  variant="primary" 
                  size="lg"
                  className="w-100" 
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
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}{t('calcComputing')}
                    </>
                  ) : t('calcCalculateBallistics')}
                </Button>
              </Col>
            </Row>
          </FormikForm>
        )}
      </Formik>

      {error && (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      )}

      {results && results.solutions && results.solutions.length > 0 && (
        <Card className="mt-4" id="results">
          <Card.Header as="h5">{t('calcBallisticSolution')}</Card.Header>
          <Card.Body>
            {/* Traditional Table View (Commented out but kept for reference) */}
            {/* <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Range</th>
                  <th>Elevation</th>
                  <th>Windage</th>
                  <th>Drop</th>
                  <th>Wind Drift</th>
                  <th>Velocity</th>
                  <th>Energy</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {results.solutions.map((solution, index) => (
                  <tr key={index}>
                    <td>{solution.range.value.toFixed(1)} {solution.range.unit}</td>
                    <td>{solution.verticalAdjustment.value.toFixed(2)} {solution.verticalAdjustment.unit}</td>
                    <td>{solution.horizontalAdjustment.value.toFixed(2)} {solution.horizontalAdjustment.unit}</td>
                    <td>{solution.drop.value.toFixed(2)} {solution.drop.unit}</td>
                    <td>{solution.wind.value.toFixed(2)} {solution.wind.unit}</td>
                    <td>{solution.velocity.value.toFixed(0)} {solution.velocity.unit}</td>
                    <td>{solution.energy.value.toFixed(0)} {solution.energy.unit}</td>
                    <td>{solution.time.toFixed(2)} s</td>
                  </tr>
                ))}
              </tbody>
            </Table> */}
            
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
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default CalculatorPage;
