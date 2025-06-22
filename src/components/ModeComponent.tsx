import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  styled
} from '@mui/material';
import Grid from '@mui/material/Grid';
import MeasurementInput from './MeasurementInput';
import { CalculationMode, RangeCardSettings } from '../hooks/useCalculator';
import { Unit } from '../types/ballistics';

interface ModeComponentProps {
  mode: CalculationMode;
  rangeCardSettings: RangeCardSettings;
  handleModeChange: (mode: CalculationMode) => void;
  handleRangeCardSettingChange: (field: keyof RangeCardSettings, value: any) => void;
  loading: boolean;
}

const ModeComponent: React.FC<ModeComponentProps> = ({
  mode,
  rangeCardSettings,
  handleModeChange,
  handleRangeCardSettingChange,
  loading
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
    <Card sx={{ mb: 4, width: '100%' }}>
      <CardHeader title={t('calcMode')} />
      <CardContent>
        <StyledFormControl fullWidth>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StyledFormLabel>{t('calcCalculationMode')}</StyledFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <RadioGroup
                row
                name="displayMode"
                value={mode}
                onChange={(e) => handleModeChange(e.target.value as CalculationMode)}
              >
                <FormControlLabel
                  value="HUD"
                  control={<Radio />}
                  label={t('calcHudMode')}
                  disabled={loading}
                />
                <FormControlLabel
                  value="RANGE_CARD"
                  control={<Radio />}
                  label={t('calcRangeCardMode')}
                  disabled={loading}
                />
              </RadioGroup>
            </Grid>
          </Grid>
        </StyledFormControl>

        {mode === 'RANGE_CARD' && (
          <>
            <StyledFormControl fullWidth>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StyledFormLabel>{t('calcRangeCardStart')}</StyledFormLabel>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <MeasurementInput
                    value={{ value: rangeCardSettings.start, unit: rangeCardSettings.unit }}
                    onChange={(newMeasurement) => {
                      handleRangeCardSettingChange('start', newMeasurement.value);
                      if (newMeasurement.unit !== rangeCardSettings.unit) {
                        handleRangeCardSettingChange('unit', newMeasurement.unit as Unit);
                      }
                    }}
                    unitOptions={[
                      { value: 'YARDS', label: t('unitYards') },
                      { value: 'METERS', label: t('unitMeters') },
                      { value: 'FEET', label: t('unitFeet') }
                    ]}
                    label=""
                    inputProps={{
                      min: 0,
                      step: 1
                    }}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </StyledFormControl>
            <StyledFormControl fullWidth>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <StyledFormLabel>{t('calcRangeCardStep')}</StyledFormLabel>
                </Grid>
                <Grid size={{ xs: 12, sm: 8 }}>
                  <MeasurementInput
                    value={{ value: rangeCardSettings.step, unit: rangeCardSettings.unit }}
                    onChange={(newMeasurement) => {
                      handleRangeCardSettingChange('step', newMeasurement.value);
                      // We keep the unit synchronized between start and step
                      if (newMeasurement.unit !== rangeCardSettings.unit) {
                        handleRangeCardSettingChange('unit', newMeasurement.unit as Unit);
                      }
                    }}
                    unitOptions={[
                      { value: 'YARDS', label: t('unitYards') },
                      { value: 'METERS', label: t('unitMeters') },
                      { value: 'FEET', label: t('unitFeet') }
                    ]}
                    label=""
                    inputProps={{
                      min: 1,
                      step: 1
                    }}
                    disabled={loading}
                  />
                </Grid>
              </Grid>
            </StyledFormControl>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ModeComponent;
