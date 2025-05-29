import React, { useState, useEffect } from 'react';
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
  Grid,
  styled
} from '@mui/material';
import MeasurementInput from './MeasurementInput';

const ModeComponent = ({
  mode,
  onModeChange,
  rangeCardStart,
  onRangeCardStartChange,
  rangeCardStep,
  onRangeCardStepChange,
  unit: defaultUnit, // Renamed to defaultUnit as we'll use it only for initial values
  onUnitChange // This will be called for backward compatibility
}) => {
  const { t } = useTranslation();
  
  // Create independent state for each input's unit
  const [startUnit, setStartUnit] = useState(defaultUnit);
  const [stepUnit, setStepUnit] = useState(defaultUnit);
  
  // Sync with parent state when defaultUnit changes
  useEffect(() => {
    setStartUnit(defaultUnit);
    setStepUnit(defaultUnit);
  }, [defaultUnit]);

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
        <StyledFormControl component="fieldset" fullWidth>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <StyledFormLabel>{t('calcCalculationMode')}</StyledFormLabel>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              <RadioGroup
                row
                name="displayMode"
                value={mode}
                onChange={(e) => onModeChange(e.target.value)}
              >
                <FormControlLabel
                  value="HUD"
                  control={<Radio />}
                  label={t('calcHudMode')}
                />
                <FormControlLabel
                  value="RANGE_CARD"
                  control={<Radio />}
                  label={t('calcRangeCardMode')}
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
                    value={{ value: Number(rangeCardStart) || 0, unit: startUnit }}
                    onChange={(newMeasurement) => {
                      onRangeCardStartChange(newMeasurement.value);
                      // Update the local unit state
                      if (newMeasurement.unit !== startUnit) {
                        setStartUnit(newMeasurement.unit);
                        // Also update parent for backward compatibility
                        onUnitChange(newMeasurement.unit);
                      }
                    }}
                    unitOptions={[
                      { value: 'YARDS', label: t('unitYards') },
                      { value: 'METERS', label: t('unitMeters') },
                      { value: 'FEET', label: t('unitFeet') }
                    ]}
                    label={null}
                    inputProps={{
                      min: 0,
                      step: 1
                    }}
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
                    value={{ value: Number(rangeCardStep) || 0, unit: stepUnit }}
                    onChange={(newMeasurement) => {
                      onRangeCardStepChange(newMeasurement.value);
                      // Update the local unit state
                      if (newMeasurement.unit !== stepUnit) {
                        setStepUnit(newMeasurement.unit);
                        // We don't update parent unit here to keep them independent
                      }
                    }}
                    unitOptions={[
                      { value: 'YARDS', label: t('unitYards') },
                      { value: 'METERS', label: t('unitMeters') },
                      { value: 'FEET', label: t('unitFeet') }
                    ]}
                    label={null}
                    inputProps={{
                      min: 1,
                      step: 1
                    }}
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
