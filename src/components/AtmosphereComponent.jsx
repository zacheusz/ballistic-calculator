import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form } from 'react-bootstrap';
import MeasurementInputMUI from './MeasurementInputMUI';

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
          <MeasurementInputMUI
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
          <MeasurementInputMUI
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
          <MeasurementInputMUI
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
