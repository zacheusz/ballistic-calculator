import React, { useRef, useState, useEffect } from 'react';
import { Form } from 'react-bootstrap';
import UnitSelectorWithConversion from './UnitSelectorWithConversion';
import ClockTimePicker from './ClockTimePicker';
import { Measurement, Unit } from '../types/ballistics';

interface MeasurementInputProps {
  value: Measurement;
  onChange: (value: Measurement) => void;
  unitOptions: Array<{ value: Unit; label: string }>;
  label?: string;
  disabled?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

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
  const [showTooltip, setShowTooltip] = useState(false);

  // Sync local state with props
  useEffect(() => {
    if (value.value !== localMeasurement.value || value.unit !== localMeasurement.unit) {
      setLocalMeasurement(value);
    }
  }, [value]);

  // Handle value change (numeric or clock)
  const handleValueChange = (newValue: number) => {
    setLocalMeasurement(prev => {
      const updated = { ...prev, value: newValue };
      onChange(updated);
      return updated;
    });
  };

  // Handle unit and value change together (for unit conversion)
  const handleUnitAndValueChange = (newUnit: Unit, convertedValue: number) => {
    const roundedValue = Math.round(convertedValue * 10000) / 10000;
    const updated = { value: roundedValue, unit: newUnit };
    setLocalMeasurement(updated);
    onChange(updated);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 3000);
  };

  // Always render value input and unit selector side-by-side
  return (
    <div className="position-relative">
      {/* Conversion tooltip overlay - positioned outside the form group */}
      {showTooltip && (
        <div 
          style={{ 
            position: 'absolute', 
            top: '-40px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            textAlign: 'center', 
            zIndex: 9999,
            width: '100%',
            cursor: 'pointer'
          }}
          onClick={() => setShowTooltip(false)}
          title="Click to dismiss"
        >
          <div className="unit-conversion-tooltip" style={{ 
            background: '#222', 
            color: '#fff', 
            padding: '6px 16px', 
            borderRadius: 6, 
            fontSize: 13, 
            display: 'inline-block', 
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)' 
          }}>
            <strong>Unit converted</strong><br />Value was converted to match new unit.
            <div style={{ fontSize: 11, marginTop: 3, opacity: 0.8 }}>Click to dismiss</div>
          </div>
        </div>
      )}
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
              size="sm"
              value={localMeasurement.value.toString()}
              min={inputProps.min as number | undefined}
              max={inputProps.max as number | undefined}
              step={inputProps.step ? inputProps.step.toString() : 'any'}
              onChange={e => handleValueChange(Number(e.target.value))}
              ref={valueInputRef}
              disabled={disabled}
              style={{ marginRight: 10, minWidth: 0, maxWidth: '100%' }}
              {...inputProps}
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
