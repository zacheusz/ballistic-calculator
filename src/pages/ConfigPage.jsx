import { useState, useEffect } from 'react';
import { Form, Button, Card, Container, Alert, Row, Col, Nav, Tab } from 'react-bootstrap';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import ThemeSelector from '../components/ThemeSelector';
import LanguageSelector from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import storageService, { STORAGE_KEYS } from '../services/storageService';
import '../i18n';

// Helper function to render unit selection dropdown
const UnitSelector = ({ fieldName, value, onChange, options }) => (
  <Form.Select 
    size="sm"
    name={fieldName}
    value={value}
    onChange={onChange}
    className="ms-2"
    style={{ width: 'auto', display: 'inline-block' }}
  >
    {options.map(option => (
      <option key={option.value} value={option.value}>{option.label}</option>
    ))}
  </Form.Select>
);

const ConfigPage = () => {
  const { t } = useTranslation();
  const { 
    apiKey, 
    environment, 
    unitPreferences, 
    firearmProfile,
    ammo,
    calculationOptions,
    displayPreferences,
    updateApiKey, 
    updateEnvironment, 
    updateUnitPreferences,
    updateFirearmProfile,
    updateAmmo,
    updateCalculationOptions,
    updateDisplayPreferences
  } = useAppContext();
  
  const [inputApiKey, setInputApiKey] = useState(apiKey);
  const [selectedEnvironment, setSelectedEnvironment] = useState(environment);
  const [preferences, setPreferences] = useState({...unitPreferences});
  const [firearm, setFirearm] = useState({...firearmProfile});
  const [ammunition, setAmmunition] = useState({...ammo});
  const [calcOptions, setCalcOptions] = useState({...calculationOptions});
  const [displayOptionsState, setDisplayOptionsState] = useState({...displayPreferences});
  const [error, setError] = useState('');
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
  
  useEffect(() => {
    setSelectedEnvironment(environment);
    setPreferences({...unitPreferences});
    setFirearm({...firearmProfile});
    setAmmunition({...ammo});
    setCalcOptions({...calculationOptions});
    setDisplayOptionsState({...displayPreferences});
  }, [environment, unitPreferences, firearmProfile, ammo, calculationOptions, displayPreferences]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputApiKey.trim()) {
      setError('API Key is required');
      return;
    }

    // Log the current calculation options before saving
    console.log('Saving calculation options:', calcOptions);
    console.log('Coriolis effect enabled:', calcOptions.calculateCoriolisEffect);
    
    // Force a clean copy of calculation options to ensure proper saving
    // Use explicit boolean conversion to ensure proper type
    const cleanCalcOptions = {
      calculateSpinDrift: Boolean(calcOptions.calculateSpinDrift),
      calculateCoriolisEffect: Boolean(calcOptions.calculateCoriolisEffect),
      calculateAeroJump: Boolean(calcOptions.calculateAeroJump),
      rangeCardStart: calcOptions.rangeCardStart,
      rangeCardStep: calcOptions.rangeCardStep
    };
    
    console.log('Clean calculation options to save:', cleanCalcOptions);

    // Update all settings in the app context
    updateApiKey(inputApiKey.trim());
    updateEnvironment(selectedEnvironment);
    updateUnitPreferences(preferences);
    updateFirearmProfile(firearm);
    updateAmmo(ammunition);
    updateCalculationOptions(cleanCalcOptions);
    updateDisplayPreferences(displayOptionsState);
    
    // Verify localStorage after saving using the storage service
    const savedOptions = storageService.loadFromStorage(STORAGE_KEYS.CALCULATION_OPTIONS);
    if (savedOptions) {
      console.log('Verified calculation options in localStorage:', savedOptions);
      console.log('Verified Coriolis effect in localStorage:', savedOptions.calculateCoriolisEffect);
    }
    
    navigate('/calculator');
  };
  
  const handleUnitChange = (unitType, value) => {
    setPreferences(prev => ({
      ...prev,
      [unitType]: value
    }));
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
  
  const handleCalcOptionsChange = (field, value) => {
    console.log(`Changing calculation option: ${field} to ${value}`);
    setCalcOptions(prev => {
      const newOptions = {
        ...prev,
        [field]: value
      };
      console.log('Updated calculation options:', newOptions);
      return newOptions;
    });
  };

  // Get theme context functions
  const { setTheme: setAppTheme } = useTheme();
  
  const handleDisplayOptionsChange = (field, value) => {
    const newDisplayOptions = {
      ...displayOptionsState,
      [field]: value
    };
    setDisplayOptionsState(newDisplayOptions);
    
    // If changing theme, use the ThemeContext to apply it
    if (field === 'theme') {
      // Apply theme change directly - tab state is preserved in URL
      setAppTheme(value);
      console.log('Theme changed through ThemeContext to:', value);
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
                <Form onSubmit={handleSubmit}>
                  {error && <Alert variant="danger">{t(error)}</Alert>}
            
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('apiKey')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('enterApiKey')}
                    value={inputApiKey}
                    onChange={(e) => setInputApiKey(e.target.value)}
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
                    onChange={(e) => setSelectedEnvironment(e.target.value)}
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
                            value={firearm.sightHeight.value}
                            onChange={(e) => handleFirearmChange('sightHeight.value', parseFloat(e.target.value))}
                            className="me-2"
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
                            value={ammunition.diameter.value}
                            onChange={(e) => handleAmmoChange('diameter.value', parseFloat(e.target.value))}
                            className="me-2"
                          />
                          <UnitSelector
                            fieldName="diameter.unit"
                            value={ammunition.diameter.unit}
                            onChange={(e) => handleAmmoChange('diameter.unit', e.target.value)}
                            options={[
                              { value: 'INCHES', label: t('inches') },
                              { value: 'CENTIMETERS', label: t('centimeters') },
                              { value: 'MILLIMETERS', label: t('millimeters') }
                            ]}
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
                            value={ammunition.mass.value}
                            onChange={(e) => handleAmmoChange('mass.value', parseFloat(e.target.value))}
                            className="me-2"
                          />
                          <UnitSelector
                            fieldName="mass.unit"
                            value={ammunition.mass.unit}
                            onChange={(e) => handleAmmoChange('mass.unit', e.target.value)}
                            options={[
                              { value: 'GRAINS', label: t('grains') },
                              { value: 'GRAMS', label: t('grams') }
                            ]}
                          />
                        </div>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label>{t('muzzleVelocity')}</Form.Label>
                        <div className="d-flex align-items-center">
                          <Form.Control
                            type="number"
                            value={ammunition.muzzleVelocity.value}
                            onChange={(e) => handleAmmoChange('muzzleVelocity.value', parseFloat(e.target.value))}
                            className="me-2"
                          />
                          <UnitSelector
                            fieldName="muzzleVelocity.unit"
                            value={ammunition.muzzleVelocity.unit}
                            onChange={(e) => handleAmmoChange('muzzleVelocity.unit', e.target.value)}
                            options={[
                              { value: 'FEET_PER_SECOND', label: t('feetPerSecond') },
                              { value: 'METERS_PER_SECOND', label: t('metersPerSecond') }
                            ]}
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
        <ThemeSelector 
          value={displayOptionsState.theme}
          onChange={e => handleDisplayOptionsChange('theme', e.target.value)}
        />
      </Card.Body>
    </Card>
  </Form>
</Tab.Pane>
            </Tab.Content>
            
            <div className="d-grid gap-2 mb-4">
              <Button variant="primary" onClick={handleSubmit} size="lg">
                {t('saveConfig')}
              </Button>
            </div>
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
