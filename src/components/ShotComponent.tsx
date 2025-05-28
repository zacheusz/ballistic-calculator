import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  Typography,
  styled
} from '@mui/material';
import MeasurementInputMUI from './MeasurementInputMUI';
import WindSegmentComponent from './WindSegmentComponent';

const ShotComponent = ({
  values,
  handleBlur,
  handleShotChange,
  setFieldValue,
  loading,
  errors,
  touched,
  calculationOptions,
  rangeInputRef,
  elevationAngleInputRef,
  getWindSegmentRef
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
      <CardHeader title={t('calcShot')} />
      <CardContent>
        <StyledFormControl fullWidth error={touched.shot?.range?.value && Boolean(errors.shot?.range?.value)}>
          <StyledFormLabel>{t('calcRange')}</StyledFormLabel>
          <MeasurementInputMUI
            label={null}
            value={values.shot.range}
            unitOptions={[
              { value: 'YARDS', label: t('unitYards') },
              { value: 'METERS', label: t('unitMeters') },
              { value: 'FEET', label: t('unitFeet') }
            ]}
            onChange={(newValue) => {
              setFieldValue('shot.range', newValue);
              handleShotChange('range', newValue);
            }}
            inputProps={{
              name: 'shot.range.value',
              onBlur: handleBlur,
              ref: rangeInputRef
            }}
            disabled={loading}
          />
          {touched.shot?.range?.value && errors.shot?.range?.value && (
            <FormHelperText error>{errors.shot?.range?.value}</FormHelperText>
          )}
        </StyledFormControl>

        <StyledFormControl fullWidth>
          <StyledFormLabel>{t('calcElevationAngle')}</StyledFormLabel>
          <MeasurementInputMUI
            value={values.shot.elevationAngle}
            onChange={(newMeasurement) => {
              handleShotChange('elevationAngle', newMeasurement);
            }}
            unitOptions={[
              { value: 'DEGREES', label: t('unitDegrees') },
              { value: 'MILS', label: t('unitMils') },
              { value: 'MOA', label: t('unitMoa') }
            ]}
            label={null}
            inputProps={{
              name: 'shot.elevationAngle.value',
              onBlur: handleBlur,
              ref: elevationAngleInputRef
            }}
            disabled={loading}
          />
        </StyledFormControl>

        {/* Only show Coriolis effect fields when the feature is enabled */}
        {calculationOptions?.calculateCoriolisEffect === true && (
          <>
            <StyledFormControl fullWidth>
              <StyledFormLabel>{t('shotAzimuth')}</StyledFormLabel>
              <MeasurementInputMUI
                value={values.shot.azimuth}
                onChange={(newMeasurement) => {
                  handleShotChange('azimuth', newMeasurement);
                }}
                unitOptions={[
                  { value: 'DEGREES', label: t('unitDegrees') }
                ]}
                label={null}
                inputProps={{
                  name: 'shot.azimuth.value',
                  onBlur: handleBlur
                }}
                disabled={loading}
              />
            </StyledFormControl>

            <StyledFormControl fullWidth>
              <StyledFormLabel>{t('shooterLatitude')}</StyledFormLabel>
              <MeasurementInputMUI
                value={values.shot.latitude}
                onChange={(newMeasurement) => {
                  handleShotChange('latitude', newMeasurement);
                }}
                unitOptions={[
                  { value: 'DEGREES', label: t('unitDegrees') }
                ]}
                label={null}
                inputProps={{
                  name: 'shot.latitude.value',
                  onBlur: handleBlur
                }}
                disabled={loading}
              />
            </StyledFormControl>
          </>
        )}

        <WindSegmentComponent
          windSegments={values.shot.windSegments}
          handleShotChange={handleShotChange}
          handleBlur={handleBlur}
          getWindSegmentRef={getWindSegmentRef}
          loading={loading}
          values={values}
        />
      </CardContent>
    </Card>
  );
};

export default ShotComponent;
