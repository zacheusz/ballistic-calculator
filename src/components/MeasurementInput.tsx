import React, { useRef, useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import UnitSelectorWithConversion from './UnitSelectorWithConversion';
import ClockTimePicker from './ClockTimePicker.tsx';
import { Measurement, Unit } from '../types/ballistics';
import { MeasurementInputProps } from '../types/componentTypes';

// Using shared MeasurementInputProps interface from componentTypes.ts

const MeasurementInput: React.FC<MeasurementInputProps> = ({
  value,
  onChange,
  unitOptions,
  label,
  disabled,
  inputProps = {},
}) => {
  const valueInputRef = useRef<HTMLInputElement>(null);
  const [localMeasurement, setLocalMeasurement] = useState<Measurement>(value);

  // Sync local state with props
  useEffect(() => {
    if (value.value !== localMeasurement.value || value.unit !== localMeasurement.unit) {
      setLocalMeasurement(value);
    }
  }, [value]);

  // Handle value change (numeric or clock)
  const handleValueChange = (newValue: number) => {
    const updated = { ...localMeasurement, value: newValue };
    setLocalMeasurement(updated);
    // Call onChange separately, not inside setState callback
    onChange(updated);
  };

  // Handle unit and value change together (for unit conversion)
  const handleUnitAndValueChange = (newUnit: Unit, convertedValue: number) => {
    const roundedValue = Math.round(convertedValue * 10000) / 10000;
    const updated = { value: roundedValue, unit: newUnit };
    setLocalMeasurement(updated);
    // Use setTimeout to defer the parent update to the next tick
    setTimeout(() => {
      onChange(updated);
    }, 0);
  };

  // Always render value input and unit selector side-by-side
  return (
    <div className="position-relative">
      <Form.Group className="d-flex align-items-center" controlId={label ? `measurement-input-${label}` : undefined}>
        {label && <Form.Label className="me-2 mb-0">{label}</Form.Label>}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
          {localMeasurement.unit === 'CLOCK' ? (
          <>
            <div style={{ flex: 1, marginRight: '10px', minWidth: 0, maxWidth: '100%' }}>
              <ClockTimePicker
                value={typeof localMeasurement.value === 'number' ? localMeasurement.value : 12}
                onChange={handleValueChange}
              />
            </div>
            <div style={{ flexShrink: 0, minWidth: 0, maxWidth: '100%' }}>
              <UnitSelectorWithConversion
                fieldName="unit"
                value={localMeasurement.unit}
                options={unitOptions}
                currentValue={typeof localMeasurement.value === 'number' ? localMeasurement.value : 0}
                onUnitAndValueChange={handleUnitAndValueChange}
                targetRef={valueInputRef}
                style={{ width: '100%' }}
              />
            </div>
          </>
        ) : (
          <>
            <Form.Control
              type="number"
              value={localMeasurement.value.toString()}
              min={inputProps.min as number | undefined}
              max={inputProps.max as number | undefined}
              step={inputProps.step ? inputProps.step.toString() : 'any'}
              onChange={e => handleValueChange(Number(e.target.value))}
              disabled={disabled}
              style={{ marginRight: 10, minWidth: 0, maxWidth: '100%' }}
              {...(inputProps as any)} // Use type assertion to avoid readonly array issues
              size="sm" // Apply size after spreading inputProps to ensure correct type
              ref={valueInputRef} // Apply our ref last to ensure it's not overridden
            />
            <div style={{ flexShrink: 0, minWidth: 0, maxWidth: '100%' }}>
              <UnitSelectorWithConversion
                fieldName="unit"
                value={localMeasurement.unit}
                options={unitOptions}
                currentValue={typeof localMeasurement.value === 'number' ? localMeasurement.value : 0}
                onUnitAndValueChange={handleUnitAndValueChange}
                targetRef={valueInputRef}
                style={{ width: '100%' }}
              />
            </div>
          </>
        )}
        </div>
      </Form.Group>
    </div>
  );
};

export default MeasurementInput;
