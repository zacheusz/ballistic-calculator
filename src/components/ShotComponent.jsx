import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Button } from 'react-bootstrap';
import MeasurementInput from './MeasurementInput';

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

  return (
    <Card className="mb-4">
      <Card.Header as="h5">{t('calcShot')}</Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>{t('calcRange')}</Form.Label>
          <MeasurementInput
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
              isInvalid: touched.shot?.range?.value && errors.shot?.range?.value,
              ref: rangeInputRef
            }}
            disabled={loading}
          />
          <Form.Control.Feedback type="invalid">
            {errors.shot?.range?.value}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('calcElevationAngle')}</Form.Label>
          <MeasurementInput
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
        </Form.Group>

        {/* Only show Coriolis effect fields when the feature is enabled */}
        {calculationOptions?.calculateCoriolisEffect === true && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>{t('shotAzimuth')}</Form.Label>
              <MeasurementInput
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
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('shooterLatitude')}</Form.Label>
              <MeasurementInput
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
            </Form.Group>
          </>
        )}

        <h6 className="mt-4 mb-3">{t('calcWindSegments')}</h6>
        {values.shot.windSegments.map((segment, index) => (
          <div key={index} className="p-3 border rounded mb-3">
            <h6>{t('calcWindSegment')} {index + 1}</h6>
            <Form.Group className="mb-3">
              <Form.Label>{t('calcMaxRange')}</Form.Label>
              <MeasurementInput
                value={segment.maxRange}
                onChange={(newMeasurement) => handleShotChange(`windSegments.${index}.maxRange`, newMeasurement)}
                unitOptions={[
                  { value: 'YARDS', label: t('unitYards') },
                  { value: 'METERS', label: t('unitMeters') },
                  { value: 'FEET', label: t('unitFeet') }
                ]}
                label={null}
                inputProps={{
                  name: `shot.windSegments[${index}].maxRange.value`,
                  onBlur: handleBlur,
                  ref: getWindSegmentRef(index, 'maxRange')
                }}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('calcWindSpeed')}</Form.Label>
              <MeasurementInput
                value={segment.speed}
                onChange={(newMeasurement) => handleShotChange(`windSegments.${index}.speed`, newMeasurement)}
                unitOptions={[
                  { value: 'MILES_PER_HOUR', label: t('unitMph') },
                  { value: 'KILOMETERS_PER_HOUR', label: t('unitKph') },
                  { value: 'METERS_PER_SECOND', label: t('unitMps') }
                ]}
                label={null}
                inputProps={{
                  name: `shot.windSegments[${index}].speed.value`,
                  onBlur: handleBlur,
                  ref: getWindSegmentRef(index, 'speed')
                }}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('calcWindDirection')}</Form.Label>
              <MeasurementInput
                value={segment.direction}
                onChange={(newMeasurement) => handleShotChange(`windSegments.${index}.direction`, newMeasurement)}
                unitOptions={[
                  { value: 'CLOCK', label: t('unitClock') },
                  { value: 'DEGREES', label: t('unitDegrees') },
                  { value: 'MILS', label: t('unitMils') },
                  { value: 'MOA', label: t('unitMoa') }
                ]}
                label={null}
                inputProps={{
                  name: `shot.windSegments[${index}].direction.value`,
                  onBlur: handleBlur,
                  ref: getWindSegmentRef(index, 'direction'),
                  min: 0
                }}
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('calcVerticalComponent')}</Form.Label>
              <MeasurementInput
                value={segment.verticalComponent || { value: 0, unit: segment.speed.unit }}
                onChange={(newMeasurement) => handleShotChange(`windSegments.${index}.verticalComponent`, newMeasurement)}
                unitOptions={[
                  { value: 'MILES_PER_HOUR', label: t('unitMph') },
                  { value: 'KILOMETERS_PER_HOUR', label: t('unitKph') },
                  { value: 'METERS_PER_SECOND', label: t('unitMps') }
                ]}
                label={null}
                inputProps={{
                  name: `shot.windSegments[${index}].verticalComponent.value`,
                  onBlur: handleBlur,
                  ref: getWindSegmentRef(index, 'verticalComponent')
                }}
                disabled={loading}
              />
            </Form.Group>

            {index > 0 && (
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => {
                  const newWindSegments = [...values.shot.windSegments];
                  newWindSegments.splice(index, 1);
                  handleShotChange('windSegments', newWindSegments);
                }}
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
          onClick={() => {
            const newWindSegments = [...values.shot.windSegments];
            newWindSegments.push({
              maxRange: { value: 1000, unit: 'YARDS' },
              speed: { value: 0, unit: 'MILES_PER_HOUR' },
              direction: { value: 3, unit: 'CLOCK' },
              verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' }
            });
            handleShotChange('windSegments', newWindSegments);
          }}
        >
          {t('calcAddWindSegment')}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default ShotComponent;
