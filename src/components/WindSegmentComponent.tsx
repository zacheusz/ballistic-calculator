import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Typography,
  Paper,
  FormControl,
  FormLabel,
  styled
} from '@mui/material';
import MeasurementInput from './MeasurementInput';
import { WindSegment } from '../types/ballistics';

interface WindSegmentComponentProps {
  windSegments: WindSegment[];
  handleShotChange: (field: string, value: any) => void;
  handleBlur: (e: React.FocusEvent<any>) => void;
  getWindSegmentRef: (index: number, field: string) => React.RefObject<HTMLInputElement>;
  loading: boolean;
  values: any; // Needed for access to values.shot.windSegments in the parent component
}

const WindSegmentComponent: React.FC<WindSegmentComponentProps> = ({
  windSegments,
  handleShotChange,
  handleBlur,
  getWindSegmentRef,
  loading
}) => {
  const { t } = useTranslation();

  const handleAddWindSegment = () => {
    const newWindSegments = [...windSegments];
    newWindSegments.push({
      maxRange: { value: 1000, unit: 'YARDS' },
      speed: { value: 0, unit: 'MILES_PER_HOUR' },
      direction: { value: 3, unit: 'CLOCK' },
      verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' }
    });
    handleShotChange('windSegments', newWindSegments);
  };

  const handleRemoveWindSegment = (index: number) => {
    const newWindSegments = [...windSegments];
    newWindSegments.splice(index, 1);
    handleShotChange('windSegments', newWindSegments);
  };

  // Styled components for consistent styling
  const StyledFormControl = styled(FormControl)(({ theme }) => ({
    marginBottom: theme.spacing(3)
  }));

  const StyledFormLabel = styled(FormLabel)(({ theme }) => ({
    marginBottom: theme.spacing(1),
    fontWeight: 500
  }));

  return (
    <>
      <Typography variant="subtitle1" sx={{ mt: 4, mb: 3 }}>{t('calcWindSegments')}</Typography>
      {windSegments.map((segment, index) => (
        <Paper key={index} elevation={1} sx={{ p: 3, mb: 3, borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>{t('calcWindSegment')} {index + 1}</Typography>
          <StyledFormControl fullWidth>
            <StyledFormLabel>{t('calcMaxRange')}</StyledFormLabel>
            <MeasurementInput
              value={segment.maxRange}
              onChange={(newMeasurement) => handleShotChange(`windSegments.${index}.maxRange`, newMeasurement)}
              unitOptions={[
                { value: 'YARDS', label: t('unitYards') },
                { value: 'METERS', label: t('unitMeters') },
                { value: 'FEET', label: t('unitFeet') }
              ]}
              label=""
              inputProps={{
                name: `shot.windSegments[${index}].maxRange.value`,
                onBlur: handleBlur,
                // Using any to bypass the type checking for ref
                // @ts-ignore - ref is handled by the MeasurementInput component
                ref: getWindSegmentRef(index, 'maxRange')
              }}
              disabled={loading}
            />
          </StyledFormControl>

          <StyledFormControl fullWidth>
            <StyledFormLabel>{t('calcWindSpeed')}</StyledFormLabel>
            <MeasurementInput
              value={segment.speed}
              onChange={(newMeasurement) => handleShotChange(`windSegments.${index}.speed`, newMeasurement)}
              unitOptions={[
                { value: 'MILES_PER_HOUR', label: t('unitMph') },
                { value: 'KILOMETERS_PER_HOUR', label: t('unitKph') },
                { value: 'METERS_PER_SECOND', label: t('unitMps') }
              ]}
              label=""
              inputProps={{
                name: `shot.windSegments[${index}].speed.value`,
                onBlur: handleBlur,
                // Using any to bypass the type checking for ref
                // @ts-ignore - ref is handled by the MeasurementInput component
                ref: getWindSegmentRef(index, 'speed')
              }}
              disabled={loading}
            />
          </StyledFormControl>

          <StyledFormControl fullWidth>
            <StyledFormLabel>{t('calcWindDirection')}</StyledFormLabel>
            <MeasurementInput
              value={segment.direction}
              onChange={(newMeasurement) => handleShotChange(`windSegments.${index}.direction`, newMeasurement)}
              unitOptions={[
                { value: 'CLOCK', label: t('unitClock') },
                { value: 'DEGREES', label: t('unitDegrees') },
                { value: 'MILS', label: t('unitMils') },
                { value: 'MOA', label: t('unitMoa') }
              ]}
              label=""
              inputProps={{
                name: `shot.windSegments[${index}].direction.value`,
                onBlur: handleBlur,
                // Using any to bypass the type checking for ref
                // @ts-ignore - ref is handled by the MeasurementInput component
                ref: getWindSegmentRef(index, 'direction'),
                min: 0
              }}
              disabled={loading}
            />
          </StyledFormControl>

          <StyledFormControl fullWidth>
            <StyledFormLabel>{t('calcVerticalComponent')}</StyledFormLabel>
            <MeasurementInput
              value={segment.verticalComponent || { value: 0, unit: segment.speed.unit }}
              onChange={(newMeasurement) => handleShotChange(`windSegments.${index}.verticalComponent`, newMeasurement)}
              unitOptions={[
                { value: 'MILES_PER_HOUR', label: t('unitMph') },
                { value: 'KILOMETERS_PER_HOUR', label: t('unitKph') },
                { value: 'METERS_PER_SECOND', label: t('unitMps') }
              ]}
              label=""
              inputProps={{
                name: `shot.windSegments[${index}].verticalComponent.value`,
                onBlur: handleBlur,
                // Using any to bypass the type checking for ref
                // @ts-ignore - ref is handled by the MeasurementInput component
                ref: getWindSegmentRef(index, 'verticalComponent')
              }}
              disabled={loading}
            />
          </StyledFormControl>

          {index > 0 && (
            <Button 
              variant="outlined" 
              color="error"
              size="small"
              onClick={() => handleRemoveWindSegment(index)}
              sx={{ mt: 1 }}
            >
              {t('calcRemoveSegment')}
            </Button>
          )}
        </Paper>
      ))}
      <Button 
        variant="outlined" 
        color="primary"
        size="small"
        sx={{ mt: 2 }}
        onClick={handleAddWindSegment}
      >
        {t('calcAddWindSegment')}
      </Button>
    </>
  );
};

export default WindSegmentComponent;
