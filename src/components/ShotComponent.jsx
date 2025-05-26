import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form } from 'react-bootstrap';
import MeasurementInput from './MeasurementInput';
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

        <WindSegmentComponent
          windSegments={values.shot.windSegments}
          handleShotChange={handleShotChange}
          handleBlur={handleBlur}
          getWindSegmentRef={getWindSegmentRef}
          loading={loading}
          values={values}
        />
      </Card.Body>
    </Card>
  );
};

export default ShotComponent;
