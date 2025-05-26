import { Measurement, Unit } from './ballistics';
import React from 'react';

/**
 * Props interface for MeasurementInput components
 * Shared between Bootstrap and MUI implementations
 */
export interface MeasurementInputProps {
  /** The measurement value and unit */
  value: Measurement;
  
  /** Callback when measurement changes */
  onChange: (value: Measurement) => void;
  
  /** Available unit options for the dropdown */
  unitOptions: Array<{ value: Unit; label: string }>;
  
  /** Optional label to display */
  label?: string;
  
  /** Whether the input is disabled */
  disabled?: boolean;
  
  /** Additional props to pass to the input element */
  inputProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;
}

/**
 * Props for the UnitSelectorWithConversion component
 */
export interface UnitSelectorProps {
  /** Field name for the form control */
  fieldName: string;
  
  /** Current unit value */
  value: Unit;
  
  /** Available unit options */
  options: Array<{ value: Unit; label: string }>;
  
  /** Current numeric value (for conversion) */
  currentValue: number;
  
  /** Optional callback for raw change events */
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  
  /** Optional callback for value changes */
  onValueChange?: (value: number) => void;
  
  /** Callback for unit and value changes together */
  onUnitAndValueChange?: (newUnit: Unit, convertedValue: number) => void;
  
  /** Reference to the target input element (for tooltips) */
  targetRef: React.RefObject<HTMLInputElement | null>;
  
  /** Optional CSS styles */
  style?: React.CSSProperties;
}

/**
 * Props for the ClockTimePicker component
 */
export interface ClockTimePickerProps {
  /** Current clock position value (1-12, can be decimal) */
  value: number;
  
  /** Callback when value changes */
  onChange: (value: number) => void;
}
