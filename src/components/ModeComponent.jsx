import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Form, Row, Col } from 'react-bootstrap';
import MeasurementInputMUI from './MeasurementInputMUI';

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

  return (
    <Card className="mb-4 w-100">
      <Card.Header as="h5">{t('calcMode')}</Card.Header>
      <Card.Body>
        <Form.Group as={Row} className="mb-3" controlId="modeSwitch">
          <Form.Label column sm="4">{t('calcCalculationMode')}</Form.Label>
          <Col sm="8">
            <Form.Check
              inline
              label={t('calcHudMode')}
              type="radio"
              name="displayMode"
              id="hud-mode"
              checked={mode === 'HUD'}
              onChange={() => onModeChange('HUD')}
            />
            <Form.Check
              inline
              label={t('calcRangeCardMode')}
              type="radio"
              name="displayMode"
              id="range-card-mode"
              checked={mode === 'RANGE_CARD'}
              onChange={() => onModeChange('RANGE_CARD')}
            />
          </Col>
        </Form.Group>

        {mode === 'RANGE_CARD' && (
          <>
            <Form.Group as={Row} className="mb-3" controlId="rangeCardStart">
              <Form.Label column sm="4">{t('calcRangeCardStart')}</Form.Label>
              <Col sm="8">
                <MeasurementInputMUI
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
              </Col>
            </Form.Group>
            <Form.Group as={Row} className="mb-3" controlId="rangeCardStep">
              <Form.Label column sm="4">{t('calcRangeCardStep')}</Form.Label>
              <Col sm="8">
                <MeasurementInputMUI
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
              </Col>
            </Form.Group>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ModeComponent;
