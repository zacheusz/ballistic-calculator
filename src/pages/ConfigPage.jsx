import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import { Form, Button, Card, Container, Alert, Row, Col, Nav, Tab } from 'react-bootstrap';
import { useAppConfigStore } from '../context/useAppConfigStore';
import { useBallistics } from '../hooks/useBallistics';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ThemeSelector from '../components/ThemeSelector';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import storageService, { STORAGE_KEYS } from '../services/storageService';
import '../i18n';

import UnitSelectorWithConversion from '../components/UnitSelectorWithConversion';

// Helper function to render unit selection dropdown with conversion
const UnitSelector = ({ fieldName, value, onChange, options, currentValue, onValueChange, targetRef }) => (
  <UnitSelectorWithConversion
    fieldName={fieldName}
    value={value}
    onChange={onChange}
    options={options}
    currentValue={currentValue}
    onValueChange={onValueChange}
    targetRef={targetRef}
  />
);

const ConfigPage = () => {
  const { t } = useTranslation();
  // Zustand store for config values
  const {
    apiKey,
    apiStage,
    setApiKey,
    setApiStage,
    theme,
    setTheme,
    language,
    setLanguage
  } = useAppConfigStore();
  
  // Create refs for input fields to position tooltips
  const sightHeightInputRef = useRef(null);
  const barrelTwistInputRef = useRef(null);
  const bulletDiameterInputRef = useRef(null);
  const bulletLengthInputRef = useRef(null);
  const bulletWeightInputRef = useRef(null);
  const muzzleVelocityInputRef = useRef(null);

  // Alias for UI compatibility
  const environment = apiStage;
  const setEnvironment = setApiStage;
  
  // Get values from Ballistics store
  const {
    firearmProfile,
    ammo,
    preferences: ballPreferences,
    atmosphere,
    shot,
    updateFirearmProfile,
    updateAmmo,
    updatePreferences,
    updateAtmosphere,
    updateShot
  } = useBallistics();
  
  // Extract unit preferences from the preferences object
  const unitPreferences = ballPreferences?.unitPreferences?.unitMappings?.reduce((acc, mapping) => {
    acc[mapping.unitTypeClassName] = mapping.unitName;
    return acc;
  }, {}) || {};
  
  // For backward compatibility
  const calculationOptions = {
    calculateSpinDrift: ballPreferences?.calculateSpinDrift || false,
    calculateCoriolisEffect: ballPreferences?.calculateCoriolisEffect || false,
    calculateAeroJump: ballPreferences?.calculateAeroJump || false,
    rangeCardStart: ballPreferences?.rangeCardStart || { value: 100, unit: 'YARDS' },
    rangeCardStep: ballPreferences?.rangeCardStep || { value: 100, unit: 'YARDS' }
  };
  
  // For backward compatibility
  const displayPreferences = { theme };

  const [inputApiKey, setInputApiKey] = useState(apiKey);

// Debounced API key update to avoid excessive calls
const debouncedUpdateApiKey = debounce((key) => {
  if (key.trim()) setApiKey(key.trim());
}, 400);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environment);
  const [preferences, setPreferences] = useState({...unitPreferences});
  const [firearm, setFirearm] = useState({...firearmProfile});
  const [ammunition, setAmmunition] = useState({...ammo});
  const [calcOptions, setCalcOptions] = useState({...calculationOptions});
  const [displayOptionsState, setDisplayOptionsState] = useState({...displayPreferences});
  const [error, setError] = useState('');
  
  const handleEnvironmentChange = (e) => {
    const newEnv = e.target.value;
    setSelectedEnvironment(newEnv);
    setEnvironment(newEnv);
    // Save immediately when changed
    if (inputApiKey.trim()) {
      setApiKey(inputApiKey.trim());
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get active tab from URL or default to 'api'
  const activeTab = searchParams.get('tab') || 'api';
  
  // Function to update the active tab in the URL
  const setActiveTab = (tab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', tab);
    setSearchParams(newParams);
  };
  
  // Initialize local state from props - only run once on initial mount or when dependencies significantly change
  useEffect(() => {
    // Only update if we have valid data to prevent unnecessary re-renders
    if (environment) {
      setSelectedEnvironment(environment);
    }
    
    // Only update preferences if they exist and have changed
    if (unitPreferences && Object.keys(unitPreferences).length > 0) {
      setPreferences(prev => {
        // Only update if different to prevent unnecessary re-renders
        return JSON.stringify(prev) !== JSON.stringify(unitPreferences) ? {...unitPreferences} : prev;
      });
    }
    
    // Only update firearm if it exists and has changed
    if (firearmProfile && Object.keys(firearmProfile).length > 0) {
      setFirearm(prev => {
        // Only update if different to prevent unnecessary re-renders
        return JSON.stringify(prev) !== JSON.stringify(firearmProfile) ? {...firearmProfile} : prev;
      });
    }
    
    // Only update ammo if it exists and has changed
    if (ammo && Object.keys(ammo).length > 0) {
      setAmmunition(prev => {
        // Only update if different to prevent unnecessary re-renders
        return JSON.stringify(prev) !== JSON.stringify(ammo) ? {...ammo} : prev;
      });
    }
    
    // Only update calculation options if they exist
    if (calculationOptions) {
      setCalcOptions(prev => {
        // Only update if different to prevent unnecessary re-renders
        return JSON.stringify(prev) !== JSON.stringify(calculationOptions) ? {...calculationOptions} : prev;
      });
    }
    
    // Only update display options if they exist
    if (displayPreferences) {
      setDisplayOptionsState(prev => {
        // Only update if different to prevent unnecessary re-renders
        return JSON.stringify(prev) !== JSON.stringify(displayPreferences) ? {...displayPreferences} : prev;
      });
    }
  // We're using JSON.stringify comparison inside the effect to prevent unnecessary updates,
  // so it's safe to include these dependencies
  }, [environment, unitPreferences, firearmProfile, ammo, calculationOptions, displayPreferences]);

  const handleUnitChange = (unitType, value) => {
    // Update the unit preferences in the ballistics store
    const unitMapping = {
      unitTypeClassName: unitType,
      unitName: value
    };
    
    // Create updated unit mappings array
    const currentMappings = ballPreferences?.unitPreferences?.unitMappings || [];
    const updatedMappings = currentMappings.filter(m => m.unitTypeClassName !== unitType);
    updatedMappings.push(unitMapping);
    
    // Create the updated unit preferences object
    const updatedUnitPreferences = {
      unitMappings: updatedMappings
    };
    
    // Update preferences in the store
    updatePreferences({
      unitPreferences: updatedUnitPreferences
    });
    
    // Update local state
    setPreferences(prev => ({
      ...prev,
      [unitType]: value
    }));
    
    // Also update the unit preferences in the API service
    // This ensures they're used in API requests
    import('../services/api').then(apiModule => {
      const api = apiModule.default;
      api.setUnitPreferences(updatedUnitPreferences);
      console.log('Updated API service unit preferences:', updatedUnitPreferences);
    });
  };
  
  const handleFirearmChange = (field, value) => {
    setFirearm(prev => {
      const newFirearm = { ...prev };
      const fieldParts = field.split('.');
      
      if (fieldParts.length === 1) {
        newFirearm[field] = value;
      } else if (fieldParts.length === 2) {
        newFirearm[fieldParts[0]][fieldParts[1]] = value;
      }
      return newFirearm;
    });
  };
  
  // Use useEffect to update the firearmProfile in the store when firearm state changes
  useEffect(() => {
    // Only update if firearm has been initialized and is different from the current firearmProfile
    if (Object.keys(firearm).length > 0 && JSON.stringify(firearm) !== JSON.stringify(firearmProfile)) {
      // Use a timeout to prevent the update from happening in the same render cycle
      const timeoutId = setTimeout(() => {
        updateFirearmProfile(firearm);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [firearm, firearmProfile, updateFirearmProfile]);
  
  const handleAmmoChange = (field, value) => {
    setAmmunition(prev => {
      const newAmmo = { ...prev };
      const fieldParts = field.split('.');
      
      if (fieldParts.length === 1) {
        newAmmo[field] = value;
      } else if (fieldParts.length === 2) {
        newAmmo[fieldParts[0]][fieldParts[1]] = value;
      } else if (fieldParts.length === 3 && fieldParts[0] === 'ballisticCoefficients') {
        // Handle array access for ballistic coefficients
        if (!newAmmo.ballisticCoefficients[parseInt(fieldParts[1])]) {
          newAmmo.ballisticCoefficients[parseInt(fieldParts[1])] = { value: 0, dragModel: newAmmo.dragModel };
        }
        newAmmo.ballisticCoefficients[parseInt(fieldParts[1])][fieldParts[2]] = value;
      }
      return newAmmo;
    });
  };
  
  // Use useEffect to update the ammo in the store when ammunition state changes
  useEffect(() => {
    // Only update if ammunition has been initialized and is different from the current ammo
    if (Object.keys(ammunition).length > 0 && JSON.stringify(ammunition) !== JSON.stringify(ammo)) {
      // Use a timeout to prevent the update from happening in the same render cycle
      const timeoutId = setTimeout(() => {
        updateAmmo(ammunition);
      }, 0);
      
      return () => clearTimeout(timeoutId);
    }
  }, [ammunition, ammo, updateAmmo]);
  
  const handleCalcOptionsChange = (field, value) => {
    // Update calculation options in the ballistics store
    updatePreferences({
      [field]: value
    });
    
    // Update local state
    setCalcOptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get theme setter from Zustand store
  // Note: We already have setTheme from useAppConfigStore at the top of the component
  const setAppTheme = setTheme; // Alias for compatibility
  
  // Handle theme change directly through Zustand
  const handleThemeChange = (value) => {
    setAppTheme(value);
    console.log('Theme changed through Zustand store to:', value);
  };
  
  // Handle other display options if needed
  const handleDisplayOptionsChange = (field, value) => {
    // Update local state
    const newDisplayOptions = {
      ...displayOptionsState,
      [field]: value
    };
    setDisplayOptionsState(newDisplayOptions);
    
    // If it's a theme change, we already handle it through Zustand
    if (field !== 'theme') {
      // For other display options, update them in the store if needed
      updatePreferences({
        [field]: value
      });
    }
  };

  return (
    <Container className="mt-5">
      <Card className="shadow">
        <Card.Header as="h4" className="bg-primary text-white">
          {t('snipeBallisticsConfig')}
        </Card.Header>
        <Card.Body>
          {/* Use a key to force the Tab.Container to maintain its state */}
          <Tab.Container 
            id="config-tabs" 
            activeKey={activeTab} 
            onSelect={(key) => setActiveTab(key)}
            mountOnEnter={true}
            unmountOnExit={false}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="api">{t('apiSettings')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="units">{t('unitPreferences')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="firearm">{t('firearmProfile')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="ammo">{t('ammunition')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="calc">{t('calculationOptions')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="display">{t('displayOptions')}</Nav.Link>
              </Nav.Item>
            </Nav>
            
            <Tab.Content>
              <Tab.Pane eventKey="api">
                <Form>
                  {error && <Alert variant="danger">{t(error)}</Alert>}
            
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('apiKey')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('enterApiKey')}
                    value={inputApiKey}
                    onChange={(e) => {
                      setInputApiKey(e.target.value);
                      debouncedUpdateApiKey(e.target.value);
                    }}
                    required
                  />
                  <Form.Text className="text-muted">
                    {t('apiKeyRequired')} 
                    {t('apiKeyStored')}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('environment')}</Form.Label>
                  <Form.Select
                    value={selectedEnvironment}
                    onChange={handleEnvironmentChange}
                  >
                    <option value="dev">{t('development')}</option>
                    <option value="test">{t('test')}</option>
                    <option value="stage">{t('staging')}</option>
                    <option value="prod">{t('production')}</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {t('selectApiEnv')}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

              </Form>
              </Tab.Pane>
              
              <Tab.Pane eventKey="units">
                <Form>
                  <Card className="mb-4">
                    <Card.Header as="h5">{t('unitPreferences')}</Card.Header>
                    <Card.Body>
                      <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>{t('range')}</Form.Label>
                      <Form.Select 
                        value={preferences.Range} 
                        onChange={(e) => handleUnitChange('Range', e.target.value)}
                      >
                        <option value="YARDS">{t('yards')}</option>
                        <option value="METERS">{t('meters')}</option>
                        <option value="FEET">{t('feet')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>{t('scopeAdjustment')}</Form.Label>
                      <Form.Select 
                        value={preferences.ScopeAdjustment} 
                        onChange={(e) => handleUnitChange('ScopeAdjustment', e.target.value)}
                      >
                        <option value="MILS">{t('mils')}</option>
                        <option value="MOA">{t('moa')}</option>
                        <option value="IPHY">{t('iphy')}</option>
                        <option value="DEGREES">{t('degrees')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>{t('temperature')}</Form.Label>
                      <Form.Select 
                        value={preferences.Temperature} 
                        onChange={(e) => handleUnitChange('Temperature', e.target.value)}
                      >
                        <option value="FAHRENHEIT">{t('fahrenheit')}</option>
                        <option value="CELSIUS">{t('celsius')}</option>
                        <option value="RANKINE">{t('rankine')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>{t('bulletVelocity')}</Form.Label>
                      <Form.Select 
                        value={preferences.BulletVelocity} 
                        onChange={(e) => handleUnitChange('BulletVelocity', e.target.value)}
                      >
                        <option value="FEET_PER_SECOND">{t('feetPerSecond')}</option>
                        <option value="METERS_PER_SECOND">{t('metersPerSecond')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>{t('windSpeed')}</Form.Label>
                      <Form.Select 
                        value={preferences.WindSpeed} 
                        onChange={(e) => handleUnitChange('WindSpeed', e.target.value)}
                      >
                        <option value="MILES_PER_HOUR">{t('milesPerHour')}</option>
                        <option value="KILOMETERS_PER_HOUR">{t('kilometersPerHour')}</option>
                        <option value="METERS_PER_SECOND">{t('metersPerSecond')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>{t('windDirection')}</Form.Label>
                      <Form.Select 
                        value={preferences.WindDirection} 
                        onChange={(e) => handleUnitChange('WindDirection', e.target.value)}
                      >
                        <option value="CLOCK">{t('clock')}</option>
                        <option value="DEGREES">{t('degrees')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>{t('atmosphericPressure')}</Form.Label>
                      <Form.Select 
                        value={preferences.AtmosphericPressure} 
                        onChange={(e) => handleUnitChange('AtmosphericPressure', e.target.value)}
                      >
                        <option value="INCHES_MERCURY">{t('inchesMercury')}</option>
                        <option value="HECTOPASCALS">{t('hectopascals')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group>
                      <Form.Label>{t('bulletWeight')}</Form.Label>
                      <Form.Select 
                        value={preferences.BulletWeight} 
                        onChange={(e) => handleUnitChange('BulletWeight', e.target.value)}
                      >
                        <option value="GRAINS">{t('grains')}</option>
                        <option value="GRAMS">{t('grams')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Form>
              </Tab.Pane>
              
              <Tab.Pane eventKey="firearm">
                <Form>
                  <Card className="mb-4">
                    <Card.Header as="h5">{t('firearmProfile')}</Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('firearmName')}</Form.Label>
                        <Form.Control
                          type="text"
                          value={firearm.name}
                          onChange={(e) => handleFirearmChange('name', e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('sightHeight')}</Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            step="0.001"
                            value={firearm.sightHeight.value}
                            onChange={(e) => handleFirearmChange('sightHeight.value', parseFloat(e.target.value))}
                            className="me-2"
                            ref={sightHeightInputRef}
                          />
                          <UnitSelector
                            fieldName="sightHeight.unit"
                            value={firearm.sightHeight.unit}
                            onChange={(e) => handleFirearmChange('sightHeight.unit', e.target.value)}
                            options={[
                              { value: 'INCHES', label: t('inches') },
                              { value: 'CENTIMETERS', label: t('centimeters') },
                              { value: 'MILLIMETERS', label: t('millimeters') }
                            ]}
                            currentValue={firearm.sightHeight.value}
                            onValueChange={(newValue) => handleFirearmChange('sightHeight.value', newValue)}
                            targetRef={sightHeightInputRef}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('barrelTwist')}</Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            value={firearm.barrelTwist.value}
                            onChange={(e) => handleFirearmChange('barrelTwist.value', parseFloat(e.target.value))}
                            className="me-2"
                            ref={barrelTwistInputRef}
                          />
                          <UnitSelector
                            fieldName="barrelTwist.unit"
                            value={firearm.barrelTwist.unit}
                            onChange={(e) => handleFirearmChange('barrelTwist.unit', e.target.value)}
                            options={[
                              { value: 'INCHES', label: t('inches') },
                              { value: 'CENTIMETERS', label: t('centimeters') },
                              { value: 'MILLIMETERS', label: t('millimeters') }
                            ]}
                            currentValue={firearm.barrelTwist.value}
                            onValueChange={(newValue) => handleFirearmChange('barrelTwist.value', newValue)}
                            targetRef={barrelTwistInputRef}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('barrelTwistDirection')}</Form.Label>
                        <Form.Select
                          value={firearm.barrelTwistDirection}
                          onChange={(e) => handleFirearmChange('barrelTwistDirection', e.target.value)}
                        >
                          <option value="RIGHT">{t('right')}</option>
                          <option value="LEFT">{t('left')}</option>
                        </Form.Select>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Form>
              </Tab.Pane>
              
              <Tab.Pane eventKey="ammo">
                <Form>
                  <Card className="mb-4">
                    <Card.Header as="h5">{t('ammunition')}</Card.Header>
                    <Card.Body>
                      <Form.Group className="mb-3">
                        <Form.Label>{t('bulletManufacturer')}</Form.Label>
                        <Form.Control
                          type="text"
                          value={ammunition.bulletManufacturer}
                          onChange={(e) => handleAmmoChange('bulletManufacturer', e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('bulletModel')}</Form.Label>
                        <Form.Control
                          type="text"
                          value={ammunition.bulletModel}
                          onChange={(e) => handleAmmoChange('bulletModel', e.target.value)}
                        />
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('dragModel')}</Form.Label>
                        <Form.Select
                          value={ammunition.dragModel}
                          onChange={(e) => handleAmmoChange('dragModel', e.target.value)}
                        >
                          <option value="G1">{t('dragModelG1')}</option>
                          <option value="G7">{t('dragModelG7')}</option>
                          <option value="CDM">{t('dragModelCDM')}</option>
                        </Form.Select>
                      </Form.Group>
                      
                      {(ammunition.dragModel === 'G1' || ammunition.dragModel === 'G7') && (
                        <Form.Group className="mb-3">
                          <Form.Label>{t('ballisticCoefficient', { dragModel: ammunition.dragModel })}</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.001"
                            value={ammunition.ballisticCoefficients[0]?.value || ''}
                            onChange={(e) => handleAmmoChange('ballisticCoefficients.0.value', parseFloat(e.target.value))}
                          />
                          <Form.Text className="text-muted">
                            {t('bcRequiredG1G7')}
                          </Form.Text>
                        </Form.Group>
                      )}

                      <Form.Group className="mb-3">
                        <Form.Label>{t('bulletDiameter')}</Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            step="0.001"
                            value={ammunition.diameter?.value || 0}
                            onChange={(e) => handleAmmoChange('diameter.value', parseFloat(e.target.value))}
                            className="me-2"
                            ref={bulletDiameterInputRef}
                          />
                          <UnitSelector
                            fieldName="diameter.unit"
                            value={ammunition.diameter?.unit || 'INCHES'}
                            onChange={(e) => handleAmmoChange('diameter.unit', e.target.value)}
                            options={[
                              { value: 'INCHES', label: t('inches') },
                              { value: 'CENTIMETERS', label: t('centimeters') },
                              { value: 'MILLIMETERS', label: t('millimeters') }
                            ]}
                            currentValue={ammunition.diameter?.value || 0}
                            onValueChange={(newValue) => handleAmmoChange('diameter.value', newValue)}
                            targetRef={bulletDiameterInputRef}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('bulletLength')}</Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            step="0.001"
                            value={ammunition.length?.value || 1.305}
                            onChange={(e) => handleAmmoChange('length.value', parseFloat(e.target.value))}
                            className="me-2"
                            ref={bulletLengthInputRef}
                          />
                          <UnitSelector
                            fieldName="length.unit"
                            value={ammunition.length?.unit || 'INCHES'}
                            onChange={(e) => handleAmmoChange('length.unit', e.target.value)}
                            options={[
                              { value: 'INCHES', label: t('inches') },
                              { value: 'CENTIMETERS', label: t('centimeters') },
                              { value: 'MILLIMETERS', label: t('millimeters') }
                            ]}
                            currentValue={ammunition.length?.value || 1.305}
                            onValueChange={(newValue) => handleAmmoChange('length.value', newValue)}
                            targetRef={bulletLengthInputRef}
                          />
                        </div>
                        <Form.Text className="text-muted">
                          {t('bulletLengthRequired')}
                        </Form.Text>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('bulletWeight')}</Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            step="0.1"
                            value={ammunition.mass?.value || 0}
                            onChange={(e) => handleAmmoChange('mass.value', parseFloat(e.target.value))}
                            className="me-2"
                            ref={bulletWeightInputRef}
                          />
                          <UnitSelector
                            fieldName="mass.unit"
                            value={ammunition.mass?.unit || 'GRAINS'}
                            onChange={(e) => handleAmmoChange('mass.unit', e.target.value)}
                            options={[
                              { value: 'GRAINS', label: t('grains') },
                              { value: 'GRAMS', label: t('grams') }
                            ]}
                            currentValue={ammunition.mass?.value || 0}
                            onValueChange={(newValue) => handleAmmoChange('mass.value', newValue)}
                            targetRef={bulletWeightInputRef}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('muzzleVelocity')}</Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            step="1"
                            value={ammunition.muzzleVelocity?.value || 0}
                            onChange={(e) => handleAmmoChange('muzzleVelocity.value', parseFloat(e.target.value))}
                            className="me-2"
                            ref={muzzleVelocityInputRef}
                          />
                          <UnitSelector
                            fieldName="muzzleVelocity.unit"
                            value={ammunition.muzzleVelocity?.unit || 'FEET_PER_SECOND'}
                            onChange={(e) => handleAmmoChange('muzzleVelocity.unit', e.target.value)}
                            options={[
                              { value: 'FEET_PER_SECOND', label: t('feetPerSecond') },
                              { value: 'METERS_PER_SECOND', label: t('metersPerSecond') }
                            ]}
                            currentValue={ammunition.muzzleVelocity?.value || 0}
                            onValueChange={(newValue) => handleAmmoChange('muzzleVelocity.value', newValue)}
                            targetRef={muzzleVelocityInputRef}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('zeroRange')}</Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            value={ammunition.zeroRange.value}
                            onChange={(e) => handleAmmoChange('zeroRange.value', parseFloat(e.target.value))}
                            className="me-2"
                          />
                          <UnitSelector
                            fieldName="zeroRange.unit"
                            value={ammunition.zeroRange.unit}
                            onChange={(e) => handleAmmoChange('zeroRange.unit', e.target.value)}
                            options={[
                              { value: 'YARDS', label: t('yards') },
                              { value: 'METERS', label: t('meters') },
                              { value: 'FEET', label: t('feet') }
                            ]}
                          />
                        </div>
                      </Form.Group>
                    </Card.Body>
                  </Card>
                </Form>
              </Tab.Pane>
              
              <Tab.Pane eventKey="calc">
                <Form>
                  <Card className="mb-4">
                    <Card.Header as="h5">{t('calculationOptions')}</Card.Header>
                    <Card.Body>
                      <Form.Check 
                        type="switch"
                        id="calculateSpinDrift"
                        label={t('calculateSpinDrift')}
                        checked={calcOptions.calculateSpinDrift}
                        onChange={(e) => handleCalcOptionsChange('calculateSpinDrift', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check 
                        type="switch"
                        id="calculateCoriolisEffect"
                        label={t('calculateCoriolisEffect')}
                        checked={calcOptions.calculateCoriolisEffect}
                        onChange={(e) => handleCalcOptionsChange('calculateCoriolisEffect', e.target.checked)}
                        className="mb-2"
                      />
                      <Form.Check 
                        type="switch"
                        id="calculateAeroJump"
                        label={t('calculateAeroJump')}
                        checked={calcOptions.calculateAeroJump}
                        onChange={(e) => handleCalcOptionsChange('calculateAeroJump', e.target.checked)}
                        className="mb-2"
                      />
                    </Card.Body>
                  </Card>
                </Form>
              </Tab.Pane>
              
              <Tab.Pane eventKey="display">
  <Form>
    <Card className="mb-4">
      <Card.Header as="h5" className="d-flex align-items-center justify-content-between">
        <span>{t('displayOptions')}</span>
        <LanguageSelector />
      </Card.Header>
      <Card.Body>
        <ThemeSelector />
      </Card.Body>
    </Card>
  </Form>
</Tab.Pane>
            </Tab.Content>
            
          </Tab.Container>
        </Card.Body>
        <Card.Footer className="text-muted">
          <small>
            Don't have an API key? Contact Snipe Technology to obtain one.
          </small>
        </Card.Footer>
      </Card>
    </Container>
  );
};

export default ConfigPage;
