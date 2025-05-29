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
  styled
} from '@mui/material';
import MeasurementInput from './MeasurementInput';
import { Atmosphere, TemperatureMeasurement, AtmosphericPressureMeasurement, AltitudeMeasurement } from '../types/ballistics';

interface AtmosphereComponentProps {
  values: {
    atmosphere: Atmosphere;
  };
  handleBlur: (e: React.FocusEvent<any>) => void;
  handleChange: (e: React.ChangeEvent<any> | { target: { name: string; value: any } }) => void;
  handleAtmosphereChange: (field: string, value: TemperatureMeasurement | AtmosphericPressureMeasurement | AltitudeMeasurement) => void;
  handleAtmosphereSimpleChange: (field: string, value: any) => void;
  loading: boolean;
  temperatureInputRef: React.RefObject<HTMLInputElement>;
  pressureInputRef: React.RefObject<HTMLInputElement>;
  altitudeInputRef: React.RefObject<HTMLInputElement>;
}

const AtmosphereComponent: React.FC<AtmosphereComponentProps> = ({ 
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
          <MeasurementInput
            value={values.atmosphere.temperature}
            onChange={(newMeasurement) => {
              handleAtmosphereChange('temperature', newMeasurement);
            }}
            unitOptions={[
              { value: 'FAHRENHEIT', label: t('unitFahrenheit') },
              { value: 'CELSIUS', label: t('unitCelsius') },
              { value: 'RANKINE', label: t('unitRankine') }
            ]}
            label={undefined}
            inputProps={{
              name: 'atmosphere.temperature.value',
              onBlur: handleBlur
            }}
            inputRef={temperatureInputRef}
            disabled={loading}
          />
        </StyledFormControl>

        <StyledFormControl fullWidth>
          <StyledFormLabel>{t('calcPressure')}</StyledFormLabel>
          <MeasurementInput
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
            label={undefined}
            inputProps={{
              name: 'atmosphere.pressure.value',
              onBlur: handleBlur,
              step: '0.01'
            }}
            inputRef={pressureInputRef}
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
            <MenuItem value="ABSOLUTE">{t('calcAbsolutePressure')}</MenuItem>
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
          <MeasurementInput
            value={values.atmosphere.altitude}
            onChange={(newMeasurement) => {
              handleAtmosphereChange('altitude', newMeasurement);
            }}
            unitOptions={[
              { value: 'FEET', label: t('unitFeet') },
              { value: 'METERS', label: t('unitMeters') },
              { value: 'YARDS', label: t('unitYards') }
            ]}
            label={undefined}
            inputProps={{
              name: 'atmosphere.altitude.value',
              onBlur: handleBlur
            }}
            inputRef={altitudeInputRef}
            disabled={loading}
          />
        </StyledFormControl>
      </CardContent>
    </Card>
  );
};

export default AtmosphereComponent;
