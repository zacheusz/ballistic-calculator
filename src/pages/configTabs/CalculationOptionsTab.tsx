import React from 'react';
import { 
  FormControlLabel, 
  Switch,
  Card,
  CardHeader,
  CardContent,
  Box
} from '@mui/material';
import MeasurementInputMUI from '../../components/MeasurementInputMUI';
import { Measurement } from '../../types/ballistics';

interface CalculationOptions {
  calculateSpinDrift: boolean;
  calculateCoriolisEffect: boolean;
  calculateAeroJump: boolean;
  rangeCardStart: Measurement;
  rangeCardStep: Measurement;
}

interface CalculationOptionsTabProps {
  options: CalculationOptions;
  onOptionsChange: (field: string, value: any) => void;
  t: (key: string) => string; // Translation function
}

const CalculationOptionsTab: React.FC<CalculationOptionsTabProps> = ({
  options,
  onOptionsChange,
  t
}) => {
  const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    onOptionsChange(field, event.target.checked);
  };

  const handleMeasurementChange = (field: string) => (measurement: Measurement) => {
    onOptionsChange(field, measurement);
  };

  return (
    <form>
      <Card sx={{ mb: 4 }}>
        <CardHeader title={t('calculationOptions')} />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.calculateSpinDrift}
                  onChange={handleSwitchChange('calculateSpinDrift')}
                  color="primary"
                />
              }
              label={t('calculateSpinDrift')}
            />
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.calculateCoriolisEffect}
                  onChange={handleSwitchChange('calculateCoriolisEffect')}
                  color="primary"
                />
              }
              label={t('calculateCoriolisEffect')}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={options.calculateAeroJump}
                  onChange={handleSwitchChange('calculateAeroJump')}
                  color="primary"
                />
              }
              label={t('calculateAeroJump')}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <CardHeader title={t('rangeCard')} sx={{ p: 0, mb: 2 }} />
            
            <Box sx={{ mb: 2 }}>
              <MeasurementInputMUI
                value={options.rangeCardStart || { value: 100, unit: 'YARDS' }}
                onChange={handleMeasurementChange('rangeCardStart')}
                unitOptions={[
                  { value: 'YARDS', label: t('yards') },
                  { value: 'METERS', label: t('meters') },
                  { value: 'FEET', label: t('feet') }
                ]}
                label={t('rangeCardStart')}
                inputProps={{
                  step: "10"
                }}
              />
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <MeasurementInputMUI
                value={options.rangeCardStep || { value: 100, unit: 'YARDS' }}
                onChange={handleMeasurementChange('rangeCardStep')}
                unitOptions={[
                  { value: 'YARDS', label: t('yards') },
                  { value: 'METERS', label: t('meters') },
                  { value: 'FEET', label: t('feet') }
                ]}
                label={t('rangeCardStep')}
                inputProps={{
                  step: "10"
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </form>
  );
};

export default CalculationOptionsTab;
