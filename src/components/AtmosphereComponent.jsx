import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form } from 'react-bootstrap';
import MeasurementInput from './MeasurementInput';

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

  return (
    <Card className="mb-4">
      <Card.Header as="h5">{t('calcAtmosphere')}</Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>{t('calcTemperature')}</Form.Label>
          <MeasurementInput
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
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('calcPressure')}</Form.Label>
          <MeasurementInput
            value={values.atmosphere.pressure}
            onChange={(newMeasurement) => {
              handleAtmosphereChange('pressure', newMeasurement);
            }}
            unitOptions={[
              { value: 'INHG', label: t('unitInHg') },
              { value: 'MMHG', label: t('unitMmHg') },
              { value: 'HPASCAL', label: t('unitHPa') },
              { value: 'MBAR', label: t('unitMbar') }
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
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('calcPressureType')}</Form.Label>
          <Form.Select
            name="atmosphere.pressureType"
            value={values.atmosphere.pressureType}
            onChange={(e) => {
              handleChange(e);
              handleAtmosphereSimpleChange('pressureType', e.target.value);
            }}
            onBlur={handleBlur}
          >
            <option value="STATION">{t('calcStationPressure')}</option>
            <option value="BAROMETRIC">{t('calcBarometricPressure')}</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('calcHumidity')}</Form.Label>
          <Form.Control
            type="number"
            min="0"
            max="100"
            name="atmosphere.humidity"
            value={values.atmosphere.humidity}
            onChange={(e) => {
              handleChange(e);
              handleAtmosphereSimpleChange('humidity', parseFloat(e.target.value));
            }}
            onBlur={handleBlur}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>{t('calcAltitude')}</Form.Label>
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
            label={null}
            inputProps={{
              name: 'atmosphere.altitude.value',
              onBlur: handleBlur,
              ref: altitudeInputRef
            }}
            disabled={loading}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default AtmosphereComponent;
