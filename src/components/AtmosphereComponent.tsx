import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  FormLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  styled
} from '@mui/material';
import MeasurementInputMUI from './MeasurementInputMUI';

const AtmosphereComponent = ({ 
  values, 
  handleBlur, 
  handleChange, 
  handleAtmosphereChange, 
  handleAtmosphereSimpleChange, 
  loading,
  temperatureInputRef,
  pressureInputRef,
  altitudeInputRef
}) => {
  const { t } = useTranslation();

  // Styled components for consistent styling
  const StyledFormControl = styled(FormControl)(({ theme }) => ({
    marginBottom: theme.spacing(3)
  }));

  const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    fontWeight: 500
  }));

  return (
    <Card sx={{ mb: 4 }}>
      <CardHeader title={t('calcAtmosphere')} />
      <CardContent>
        <StyledFormControl fullWidth>
          <StyledFormLabel>{t('calcTemperature')}</StyledFormLabel>
          <MeasurementInputMUI
            value={values.atmosphere.temperature}
            onChange={(newMeasurement) => {
              handleAtmosphereChange('temperature', newMeasurement);
            }}
            unitOptions={[
              { value: 'FAHRENHEIT', label: t('unitFahrenheit') },
              { value: 'CELSIUS', label: t('unitCelsius') },
              { value: 'KELVIN', label: t('unitKelvin') }
            ]}
            label={null}
            inputProps={{
              name: 'atmosphere.temperature.value',
              onBlur: handleBlur,
              ref: temperatureInputRef
            }}
            disabled={loading}
          />
        </StyledFormControl>

        <StyledFormControl fullWidth>
          <StyledFormLabel>{t('calcPressure')}</StyledFormLabel>
          <MeasurementInputMUI
            value={values.atmosphere.pressure}
            onChange={(newMeasurement) => {
              handleAtmosphereChange('pressure', newMeasurement);
            }}
            unitOptions={[
              // Use the exact unit names from the API for consistency
              // The API uses INCHES_MERCURY and HECTOPASCALS for atmospheric pressure
              { value: 'INCHES_MERCURY', label: t('unitInHg') },
              { value: 'HECTOPASCALS', label: t('unitHPa') }
            ]}
            label={null}
            inputProps={{
              name: 'atmosphere.pressure.value',
              onBlur: handleBlur,
              ref: pressureInputRef,
              step: '0.01'
            }}
            disabled={loading}
          />
        </StyledFormControl>

        <StyledFormControl fullWidth>
          <StyledFormLabel>{t('calcPressureType')}</StyledFormLabel>
          <Select
            name="atmosphere.pressureType"
            value={values.atmosphere.pressureType}
            onChange={(e) => {
              // Create a synthetic event that mimics the structure expected by handleChange
              const syntheticEvent = {
                target: {
                  name: 'atmosphere.pressureType',
                  value: e.target.value
                }
              };
              handleChange(syntheticEvent);
              handleAtmosphereSimpleChange('pressureType', e.target.value);
            }}
            onBlur={handleBlur}
            size="small"
            fullWidth
          >
            <MenuItem value="STATION">{t('calcStationPressure')}</MenuItem>
            <MenuItem value="BAROMETRIC">{t('calcBarometricPressure')}</MenuItem>
          </Select>
        </StyledFormControl>

        <StyledFormControl fullWidth>
          <StyledFormLabel>{t('calcHumidity')}</StyledFormLabel>
          <TextField
            type="number"
            inputProps={{
              min: 0,
              max: 100
            }}
            name="atmosphere.humidity"
            value={values.atmosphere.humidity}
            onChange={(e) => {
              handleChange(e);
              handleAtmosphereSimpleChange('humidity', parseFloat(e.target.value));
            }}
            onBlur={handleBlur}
            size="small"
            fullWidth
          />
        </StyledFormControl>

        <StyledFormControl fullWidth>
          <StyledFormLabel>{t('calcAltitude')}</StyledFormLabel>
          <MeasurementInputMUI
            value={values.atmosphere.altitude}
            onChange={(newMeasurement) => {
              handleAtmosphereChange('altitude', newMeasurement);
            }}
            unitOptions={[
              { value: 'FEET', label: t('unitFeet') },
              { value: 'METERS', label: t('unitMeters') },
              { value: 'YARDS', label: t('unitYards') }
            ]}
            label={null}
            inputProps={{
              name: 'atmosphere.altitude.value',
              onBlur: handleBlur,
              ref: altitudeInputRef
            }}
            disabled={loading}
          />
        </StyledFormControl>
      </CardContent>
    </Card>
  );
};

export default AtmosphereComponent;
