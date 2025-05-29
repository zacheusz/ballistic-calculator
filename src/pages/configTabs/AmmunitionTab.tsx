import React from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import MeasurementInput from '../../components/MeasurementInput';
import { Ammo, Measurement } from '../../types/ballistics';

interface AmmunitionTabProps {
  ammunition: Ammo;
  onAmmoChange: (field: string, value: any) => void;
  onAmmoMeasurementChange: (field: string, measurement: Measurement) => void;
  t: (key: string, options?: Record<string, any>) => string; // Translation function with interpolation support
}

const AmmunitionTab: React.FC<AmmunitionTabProps> = ({
  ammunition,
  onAmmoChange,
  onAmmoMeasurementChange,
  t
}) => {
  const handleDragModelChange = (event: SelectChangeEvent) => {
    onAmmoChange('dragModel', event.target.value);
  };

  return (
    <form>
      <Card sx={{ mb: 4 }}>
        <CardHeader title={t('ammunition')} />
        <CardContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel shrink htmlFor="bullet-manufacturer">{t('bulletManufacturer')}</InputLabel>
            <TextField
              id="bullet-manufacturer"
              fullWidth
              value={ammunition.bulletManufacturer || ''}
              onChange={(e) => onAmmoChange('bulletManufacturer', e.target.value)}
              size="small"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel shrink htmlFor="bullet-model">{t('bulletModel')}</InputLabel>
            <TextField
              id="bullet-model"
              fullWidth
              value={ammunition.bulletModel || ''}
              onChange={(e) => onAmmoChange('bulletModel', e.target.value)}
              size="small"
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="drag-model-label">{t('dragModel')}</InputLabel>
            <Select
              labelId="drag-model-label"
              value={ammunition.dragModel || ''}
              onChange={handleDragModelChange}
              fullWidth
              size="small"
            >
              <MenuItem value="G1">{t('dragModelG1')}</MenuItem>
              <MenuItem value="G7">{t('dragModelG7')}</MenuItem>
              <MenuItem value="CDM">{t('dragModelCDM')}</MenuItem>
            </Select>
          </FormControl>
          
          {(ammunition.dragModel === 'G1' || ammunition.dragModel === 'G7') && (
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel shrink htmlFor="ballistic-coefficient">
                {t('ballisticCoefficient', { dragModel: ammunition.dragModel })}
              </InputLabel>
              <TextField
                id="ballistic-coefficient"
                type="number"
                fullWidth
                inputProps={{ step: "0.001" }}
                value={ammunition.ballisticCoefficients && ammunition.ballisticCoefficients[0]?.value || ''}
                onChange={(e) => onAmmoChange('ballisticCoefficients.0.value', parseFloat(e.target.value))}
                size="small"
              />
              <Typography variant="caption" color="text.secondary">
                {t('bcRequiredG1G7')}
              </Typography>
            </FormControl>
          )}

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('bulletDiameter')}
            </Typography>
            <MeasurementInput
              value={ammunition.diameter || { value: 0, unit: 'INCHES' }}
              onChange={(newMeasurement) => onAmmoMeasurementChange('diameter', newMeasurement)}
              unitOptions={[
                { value: 'INCHES', label: t('inches') },
                { value: 'CENTIMETERS', label: t('centimeters') },
                { value: 'MILLIMETERS', label: t('millimeters') }
              ]}
              label=""
              inputProps={{
                step: "0.001"
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('bulletLength')}
            </Typography>
            <MeasurementInput
              value={ammunition.length || { value: 1.305, unit: 'INCHES' }}
              onChange={(newMeasurement) => onAmmoMeasurementChange('length', newMeasurement)}
              unitOptions={[
                { value: 'INCHES', label: t('inches') },
                { value: 'CENTIMETERS', label: t('centimeters') },
                { value: 'MILLIMETERS', label: t('millimeters') }
              ]}
              label=""
              inputProps={{
                step: "0.001"
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t('bulletLengthRequired')}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('bulletWeight')}
            </Typography>
            <MeasurementInput
              value={ammunition.mass || { value: 0, unit: 'GRAINS' }}
              onChange={(newMeasurement) => onAmmoMeasurementChange('mass', newMeasurement)}
              unitOptions={[
                { value: 'GRAINS', label: t('grains') },
                { value: 'GRAMS', label: t('grams') }
              ]}
              label=""
              inputProps={{
                step: "0.1"
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('muzzleVelocity')}
            </Typography>
            <MeasurementInput
              value={ammunition.muzzleVelocity || { value: 0, unit: 'FEET_PER_SECOND' }}
              onChange={(newMeasurement) => onAmmoMeasurementChange('muzzleVelocity', newMeasurement)}
              unitOptions={[
                { value: 'FEET_PER_SECOND', label: t('feetPerSecond') },
                { value: 'METERS_PER_SECOND', label: t('metersPerSecond') }
              ]}
              label=""
              inputProps={{
                step: "1"
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('zeroRange')}
            </Typography>
            <MeasurementInput
              value={ammunition.zeroRange || { value: 100, unit: 'YARDS' }}
              onChange={(newMeasurement) => onAmmoMeasurementChange('zeroRange', newMeasurement)}
              unitOptions={[
                { value: 'YARDS', label: t('yards') },
                { value: 'METERS', label: t('meters') },
                { value: 'FEET', label: t('feet') }
              ]}
              label=""
              inputProps={{
                step: "1"
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </form>
  );
};

export default AmmunitionTab;
