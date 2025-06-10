import React, { useRef } from 'react';
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
import { useCalculator } from '../hooks/useCalculator';



// Import components
import BallisticsResultsGrid from '../components/BallisticsResultsGrid';
import AtmosphereComponent from '../components/AtmosphereComponent';
import ShotComponent from '../components/ShotComponent';
import ModeComponent from '../components/ModeComponent';

// Define validation schema
const validationSchema = Yup.object({
  shot: Yup.object({
    range: Yup.object({
      value: Yup.number().required('Range is required'),
    }),
  }),
});

const CalculatorPage: React.FC = () => {
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
  
  // Use our calculator hook for state management
  const {
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
    addWindSegment,
    removeWindSegment,
    handleModeChange,
    handleRangeCardSettingChange,
    calculateBallistics,
  } = useCalculator();
  
  // Extract calculation options from preferences
  const calculationOptions = preferences || {};
  
  // Create handlers for form components
  const handleAtmosphereChange = (field: string, value: any) => {
    updateAtmosphere({ [field]: value });
  };
  
  const handleShotChange = (field: string, value: any) => {
    updateShot({ [field]: value });
  };

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
      
      <Formik
        initialValues={{ atmosphere, shot }}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={() => {
          calculateBallistics();
        }}
      >
        {({ errors, touched, handleBlur, handleSubmit, setFieldValue }) => (
          <FormikForm onSubmit={handleSubmit}>
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
                  handleAtmosphereChange={handleAtmosphereChange}
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
                  values={{ shot }}
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
          </FormikForm>
        )}
      </Formik>
    </Container>
  );
};

export default CalculatorPage;
