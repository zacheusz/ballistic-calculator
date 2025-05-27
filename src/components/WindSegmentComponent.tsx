import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, Button } from 'react-bootstrap';
import MeasurementInputMUI from './MeasurementInputMUI';
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

  return (
    <>
      <h6 className="mt-4 mb-3">{t('calcWindSegments')}</h6>
      {windSegments.map((segment, index) => (
        <div key={index} className="p-3 border rounded mb-3">
          <h6>{t('calcWindSegment')} {index + 1}</h6>
          <Form.Group className="mb-3">
            <Form.Label>{t('calcMaxRange')}</Form.Label>
            <MeasurementInputMUI
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
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('calcWindSpeed')}</Form.Label>
            <MeasurementInputMUI
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
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('calcWindDirection')}</Form.Label>
            <MeasurementInputMUI
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
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>{t('calcVerticalComponent')}</Form.Label>
            <MeasurementInputMUI
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
          </Form.Group>

          {index > 0 && (
            <Button 
              variant="outline-danger" 
              size="sm"
              onClick={() => handleRemoveWindSegment(index)}
            >
              {t('calcRemoveSegment')}
            </Button>
          )}
        </div>
      ))}
      <Button 
        variant="outline-primary" 
        size="sm"
        className="mt-2"
        onClick={handleAddWindSegment}
      >
        {t('calcAddWindSegment')}
      </Button>
    </>
  );
};

export default WindSegmentComponent;
