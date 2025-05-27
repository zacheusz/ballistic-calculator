import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Typography, Box, Paper } from '@mui/material';
import { useTranslation } from 'react-i18next';

// Import both versions for comparison
import MeasurementInput from '../components/MeasurementInput';
import MeasurementInputMUI from '../components/MeasurementInputMUI';

const MuiTestPage = () => {
  const { t } = useTranslation();
  
  // Sample data for testing
  const [distanceBS, setDistanceBS] = useState({ value: 100, unit: 'YARDS' });
  const [distanceMUI, setDistanceMUI] = useState({ value: 100, unit: 'YARDS' });
  const [velocityBS, setVelocityBS] = useState({ value: 2800, unit: 'FEET_PER_SECOND' });
  const [velocityMUI, setVelocityMUI] = useState({ value: 2800, unit: 'FEET_PER_SECOND' });
  const [angleBS, setAngleBS] = useState({ value: 3, unit: 'CLOCK' });
  const [angleMUI, setAngleMUI] = useState({ value: 3, unit: 'CLOCK' });
  
  // Unit options for different measurement types
  const distanceUnitOptions = [
    { value: 'YARDS', label: t('unitYards') },
    { value: 'METERS', label: t('unitMeters') },
    { value: 'FEET', label: t('unitFeet') }
  ];
  
  const velocityUnitOptions = [
    { value: 'FEET_PER_SECOND', label: t('unitFeetPerSecond') },
    { value: 'METERS_PER_SECOND', label: t('unitMetersPerSecond') }
  ];
  
  const angleUnitOptions = [
    { value: 'DEGREES', label: t('unitDegrees') },
    { value: 'MILS', label: t('unitMils') },
    { value: 'MOA', label: t('unitMOA') },
    { value: 'CLOCK', label: t('unitClock') }
  ];
  
  return (
    <Container className="mt-4">
      <h1 className="mb-4">{t('muiComponentMigrationTest')}</h1>
      
      <Row className="mb-5">
        <Col md={6}>
          <Card>
            <Card.Header as="h5">{t('bootstrapComponents')}</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <MeasurementInput
                  value={distanceBS}
                  onChange={setDistanceBS}
                  unitOptions={distanceUnitOptions}
                  label={t('distance')}
                  inputProps={{ min: 0 }}
                />
              </div>
              
              <div className="mb-3">
                <MeasurementInput
                  value={velocityBS}
                  onChange={setVelocityBS}
                  unitOptions={velocityUnitOptions}
                  label={t('velocity')}
                  inputProps={{ min: 0 }}
                />
              </div>
              
              <div className="mb-3">
                <MeasurementInput
                  value={angleBS}
                  onChange={setAngleBS}
                  unitOptions={angleUnitOptions}
                  label={t('windDirection')}
                />
              </div>
              
              <div className="mt-4">
                <h6>{t('currentValues')}</h6>
                <pre>{JSON.stringify({
                  distance: distanceBS,
                  velocity: velocityBS,
                  angle: angleBS
                }, null, 2)}</pre>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Paper elevation={2} sx={{ height: '100%' }}>
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <Typography variant="h5">{t('muiComponents')}</Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <MeasurementInputMUI
                  value={distanceMUI}
                  onChange={setDistanceMUI}
                  unitOptions={distanceUnitOptions}
                  label={t('distance')}
                  inputProps={{ min: 0 }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <MeasurementInputMUI
                  value={velocityMUI}
                  onChange={setVelocityMUI}
                  unitOptions={velocityUnitOptions}
                  label={t('velocity')}
                  inputProps={{ min: 0 }}
                />
              </Box>
              
              <Box sx={{ mb: 3 }}>
                <MeasurementInputMUI
                  value={angleMUI}
                  onChange={setAngleMUI}
                  unitOptions={angleUnitOptions}
                  label={t('windDirection')}
                />
              </Box>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1">{t('currentValues')}</Typography>
                <Box component="pre" sx={{ 
                  bgcolor: 'background.paper', 
                  p: 2, 
                  border: 1, 
                  borderColor: 'divider',
                  borderRadius: 1
                }}>
                  {JSON.stringify({
                    distance: distanceMUI,
                    velocity: velocityMUI,
                    angle: angleMUI
                  }, null, 2)}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Col>
      </Row>
    </Container>
  );
};

export default MuiTestPage;
