import React, { useState } from 'react';
import { Form, Overlay, Tooltip } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { convertUnit } from '../utils/unitConversion';
import './UnitSelectorWithConversion.css';

/**
 * UnitSelectorWithConversion - A component that handles unit selection with automatic value conversion
 * 
 * @param {Object} props - Component props
 * @param {string} props.fieldName - Name of the field
 * @param {string} props.value - Current unit value
 * @param {Function} props.onChange - Function to call when unit changes
 * @param {Array} props.options - Array of unit options [{value, label}]
 * @param {number} props.currentValue - Current numeric value
 * @param {Function} props.onValueChange - Function to call when value changes due to unit conversion
 * @param {Object} props.targetRef - Reference to the input field for tooltip positioning
 */
const UnitSelectorWithConversion = ({ 
  fieldName, 
  value, 
  onChange, 
  options, 
  currentValue,
  onValueChange,
  targetRef
}) => {
  const { t } = useTranslation();
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Handle unit change with conversion
  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    const oldUnit = value;
    
    // Only convert if units are different and we have a valid current value
    if (newUnit !== oldUnit && currentValue !== undefined && !isNaN(currentValue)) {
      // Convert the value from old unit to new unit
      const convertedValue = convertUnit(currentValue, oldUnit, newUnit);
      
      // Round to 4 decimal places for better display
      const roundedValue = Math.round(convertedValue * 10000) / 10000;
      
      // Update the value with the converted one
      onValueChange(roundedValue);
      
      // Show the tooltip notification
      setShowTooltip(true);
      
      // Hide tooltip after 5 seconds
      setTimeout(() => {
        setShowTooltip(false);
      }, 5000);
    }
    
    // Call the original onChange handler
    onChange(e);
  };
  
  return (
    <>
      <Form.Select 
        size="sm"
        name={fieldName}
        value={value}
        onChange={handleUnitChange}
        className="ms-2"
        style={{ width: 'auto', display: 'inline-block' }}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Form.Select>
      
      {targetRef && (
        <Overlay 
          target={targetRef.current} 
          show={showTooltip} 
          placement="top"
        >
          {(props) => (
            <Tooltip id={`tooltip-${fieldName}`} {...props} className="unit-conversion-tooltip">
              <strong>{t('unitConversionNotice')}</strong>
              <div>{t('unitConversionDescription')}</div>
            </Tooltip>
          )}
        </Overlay>
      )}
    </>
  );
};

export default UnitSelectorWithConversion;
