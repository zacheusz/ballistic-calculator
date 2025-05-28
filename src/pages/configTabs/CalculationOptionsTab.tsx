import React from 'react';
import { 
  FormControlLabel, 
  Switch,
  Card,
  CardHeader,
  CardContent,
  Box
} from '@mui/material';

interface CalculationOptions {
  calculateSpinDrift: boolean;
  calculateCoriolisEffect: boolean;
  calculateAeroJump: boolean;
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

  // We no longer need handleMeasurementChange since rangeCardStart and rangeCardStep are handled elsewhere

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

          {/* Range card settings are handled by ModeComponent.jsx */}
        </CardContent>
      </Card>
    </form>
  );
};

export default CalculationOptionsTab;
