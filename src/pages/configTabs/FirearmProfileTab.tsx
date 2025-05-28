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
import MeasurementInputMUI from '../../components/MeasurementInputMUI';
import { FirearmProfile, Measurement } from '../../types/ballistics';

interface FirearmProfileTabProps {
  firearm: FirearmProfile;
  onFirearmChange: (field: string, value: any) => void;
  onFirearmMeasurementChange: (field: string, measurement: Measurement) => void;
  t: (key: string) => string; // Translation function
}

const FirearmProfileTab: React.FC<FirearmProfileTabProps> = ({
  firearm,
  onFirearmChange,
  onFirearmMeasurementChange,
  t
}) => {
  const handleDirectionChange = (event: SelectChangeEvent) => {
    onFirearmChange('barrelTwistDirection', event.target.value);
  };

  return (
    <form>
      <Card sx={{ mb: 4 }}>
        <CardHeader title={t('firearmProfile')} />
        <CardContent>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel shrink htmlFor="firearm-name">{t('firearmName')}</InputLabel>
            <TextField
              id="firearm-name"
              fullWidth
              value={firearm.name || ''}
              onChange={(e) => onFirearmChange('name', e.target.value)}
              size="small"
            />
          </FormControl>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              {t('sightHeight')}
            </Typography>
            <MeasurementInputMUI
              value={firearm.sightHeight || { value: 0, unit: 'INCHES' }}
              onChange={(newMeasurement) => onFirearmMeasurementChange('sightHeight', newMeasurement)}
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
              {t('barrelTwist')}
            </Typography>
            <MeasurementInputMUI
              value={firearm.barrelTwist || { value: 0, unit: 'INCHES' }}
              onChange={(newMeasurement) => onFirearmMeasurementChange('barrelTwist', newMeasurement)}
              unitOptions={[
                { value: 'INCHES', label: t('inches') },
                { value: 'CENTIMETERS', label: t('centimeters') },
                { value: 'MILLIMETERS', label: t('millimeters') }
              ]}
              label=""
              inputProps={{}}
            />
          </Box>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="barrel-twist-direction-label">{t('barrelTwistDirection')}</InputLabel>
            <Select
              labelId="barrel-twist-direction-label"
              value={firearm.barrelTwistDirection || ''}
              onChange={handleDirectionChange}
              fullWidth
              size="small"
            >
              <MenuItem value="RIGHT">{t('right')}</MenuItem>
              <MenuItem value="LEFT">{t('left')}</MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </Card>
    </form>
  );
};

export default FirearmProfileTab;
