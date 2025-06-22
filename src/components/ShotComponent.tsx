import React, { useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  FormLabel,
  FormHelperText,
  styled
} from '@mui/material';
import MeasurementInput from './MeasurementInput';
import WindSegmentComponent from './WindSegmentComponent';
import { Shot, RangeMeasurement, AngleMeasurement, WindSegment } from '../types/ballistics';

interface ShotComponentProps {
  values: { shot: Shot };
  handleBlur: (e: React.FocusEvent<any>) => void;
  handleShotChange: (field: string, value: RangeMeasurement | AngleMeasurement | WindSegment[] | any) => void;
  loading: boolean;
  errors: any;
  touched: any;
  calculationOptions?: Record<string, any>;
  rangeInputRef: React.RefObject<any>;
  elevationAngleInputRef: React.RefObject<any>;
  getWindSegmentRef: (index: number, field: string) => React.RefObject<any>;
  addWindSegment: (segment: WindSegment) => void;
  removeWindSegment: (index: number) => void;
}

const ShotComponent: React.FC<ShotComponentProps> = ({
  values,
  handleBlur,
  handleShotChange,
  loading,
  errors,
  touched,
  calculationOptions,
  rangeInputRef,
  elevationAngleInputRef,
  getWindSegmentRef,
  addWindSegment,
  removeWindSegment
}) => {
  const { t } = useTranslation();

  // Stable callbacks to preserve debouncing in MeasurementInput
  const handleRangeChange = useCallback((value: RangeMeasurement) => {
    handleShotChange('range', value);
  }, [handleShotChange]);

  const handleElevationAngleChange = useCallback((value: AngleMeasurement) => {
    handleShotChange('elevationAngle', value);
  }, [handleShotChange]);

  const handleAzimuthChange = useCallback((value: AngleMeasurement) => {
    handleShotChange('azimuth', value);
  }, [handleShotChange]);

  const handleLatitudeChange = useCallback((value: AngleMeasurement) => {
    handleShotChange('latitude', value);
  }, [handleShotChange]);

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
          <MeasurementInput
            label=""
            value={values.shot.range}
            unitOptions={[
              { value: 'YARDS', label: t('unitYards') },
              { value: 'METERS', label: t('unitMeters') },
            ]}
            onChange={handleRangeChange}
            disabled={loading}
            inputRef={rangeInputRef}
            inputProps={{
              name: 'shot.range.value',
              onBlur: handleBlur
            }}
          />
          {touched.shot?.range?.value && errors.shot?.range?.value && (
            <FormHelperText error>{errors.shot?.range?.value}</FormHelperText>
          )}
        </StyledFormControl>

        <StyledFormControl fullWidth>
          <StyledFormLabel>{t('calcElevationAngle')}</StyledFormLabel>
          <MeasurementInput
            value={values.shot.elevationAngle}
            onChange={handleElevationAngleChange}
            unitOptions={[
              { value: 'DEGREES', label: t('unitDegrees') },
              { value: 'MILS', label: t('unitMils') },
              { value: 'MOA', label: t('unitMoa') }
            ]}
            label=""
            disabled={loading}
            inputRef={elevationAngleInputRef}
            inputProps={{
              name: 'shot.elevationAngle.value',
              onBlur: handleBlur
            }}
          />
        </StyledFormControl>

        {/* Only show Coriolis effect fields when the feature is enabled */}
        {calculationOptions?.calculateCoriolisEffect === true && (
          <>
            <StyledFormControl fullWidth>
              <StyledFormLabel>{t('shotAzimuth')}</StyledFormLabel>
              <MeasurementInput
                value={values.shot.azimuth}
                onChange={handleAzimuthChange}
                unitOptions={[
                  { value: 'DEGREES', label: t('unitDegrees') }
                ]}
                label=""
                disabled={loading}
                inputProps={{
                  name: 'shot.azimuth.value',
                  onBlur: handleBlur
                }}
              />
            </StyledFormControl>

            <StyledFormControl fullWidth>
              <StyledFormLabel>{t('shooterLatitude')}</StyledFormLabel>
              <MeasurementInput
                value={values.shot.latitude}
                onChange={handleLatitudeChange}
                unitOptions={[
                  { value: 'DEGREES', label: t('unitDegrees') }
                ]}
                label=""
                disabled={loading}
                inputProps={{
                  name: 'shot.latitude.value',
                  onBlur: handleBlur
                }}
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
          addWindSegment={addWindSegment}
          removeWindSegment={removeWindSegment}
        />
      </CardContent>
    </Card>
  );
};

export default memo(ShotComponent);
