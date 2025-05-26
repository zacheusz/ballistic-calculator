import React, { useState, RefObject } from 'react';
import { Form, Overlay, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { convertUnit } from '../utils/unitConversion';
import './UnitSelectorWithConversion.css';
import { Unit } from '../types/ballistics';

interface UnitOption {
  value: Unit;
  label: string;
}

interface UnitSelectorWithConversionProps {
  fieldName: string;
  value: Unit;
  options: UnitOption[];
  currentValue: number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onValueChange?: (value: number) => void;
  onUnitAndValueChange?: (newUnit: Unit, convertedValue: number) => void;
  targetRef: RefObject<HTMLInputElement | null>;
  style?: React.CSSProperties;
}

/**
 * UnitSelectorWithConversion - A component that handles unit selection with automatic value conversion
 */
const UnitSelectorWithConversion: React.FC<UnitSelectorWithConversionProps> = ({ 
  fieldName, 
  value, 
  options, 
  currentValue,
  onChange,
  onValueChange,
  onUnitAndValueChange,
  targetRef,
  style
}) => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Handle unit change with conversion
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value as Unit;
    const oldUnit = value;
    
    // Call original onChange handler if provided
    if (onChange) {
      onChange(e);
    }
    
    // Only convert if units are different and we have a valid current value
    if (newUnit !== oldUnit && currentValue !== undefined && !isNaN(currentValue)) {
      // Convert the value from old unit to new unit
      const convertedValue = convertUnit(currentValue, oldUnit, newUnit);
      
      // Round to 4 decimal places for better display
      const roundedValue = Math.round(convertedValue * 10000) / 10000;
      
      // Call the parent's handlers with the new values
      if (onUnitAndValueChange) {
        onUnitAndValueChange(newUnit, roundedValue);
      }
      
      // Call onValueChange if provided
      if (onValueChange) {
        onValueChange(roundedValue);
      }
      
      // Show the tooltip notification
      setShowTooltip(true);
      
      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
    }
  };

  return (
    <>
      <Form.Select 
        size="sm"
        name={fieldName}
        value={value}
        onChange={handleUnitChange}
        className="ms-2"
        style={{ width: 'auto', display: 'inline-block', ...style }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Form.Select>
      
      {targetRef && targetRef.current && (
        <Overlay 
          target={targetRef.current} 
          show={showTooltip} 
          placement="top"
        >
          {(props) => (
            <Tooltip id={`tooltip-${fieldName}`} {...props} className="unit-conversion-tooltip">
              <strong>{t('unitConversionNotice')}</strong>
              <div>{t('unitConversionDescription')}</div>
              <div className="mt-1 small text-muted">{t('clickToDismiss')}</div>
            </Tooltip>
          )}
        </Overlay>
      )}
    </>
  );
};

export default UnitSelectorWithConversion;
