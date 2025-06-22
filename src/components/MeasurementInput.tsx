import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  Box,
  Typography,
  styled
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { convertUnit } from '../utils/unitConversion';
import ClockTimePicker from './ClockTimePicker.tsx';
import { Unit } from '../types/ballistics';
import { MeasurementInputProps } from '../types/componentTypes';

// Styled components for consistent styling
const StyledTextField = styled(TextField)(({ theme }) => ({
  minWidth: 0,
  maxWidth: '100%',
  marginRight: theme.spacing(1),
  '& .MuiInputBase-input': {
    padding: '8px 10px', // Smaller padding for compact look
    fontSize: '0.875rem', // Smaller font size
  },
}));

const StyledSelect = styled(Select)(() => ({
  minWidth: 0,
  maxWidth: '100%',
  '& .MuiSelect-select': {
    padding: '8px 32px 8px 10px', // Smaller padding for compact look
    fontSize: '0.875rem', // Smaller font size
  },
}));

// Using shared MeasurementInputProps interface from componentTypes.ts

const MeasurementInput: React.FC<MeasurementInputProps> = ({
  value,
  onChange,
  unitOptions,
  label,
  disabled,
  inputProps = {},
  inputRef,
}) => {
  const { t } = useTranslation(); // Used for translations
  const valueInputRef = useRef<HTMLInputElement>(null);
  // Access Material UI's snackbar system
  const { enqueueSnackbar } = useSnackbar();

  // Local state for the input value to prevent focus loss
  const [localValue, setLocalValue] = useState(value.value.toString());
  const [localUnit, setLocalUnit] = useState(value.unit);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Update local state when prop value changes (from external source)
  useEffect(() => {
    setLocalValue(value.value.toString());
    setLocalUnit(value.unit);
  }, [value.value, value.unit]);

  // Debounced update to parent component
  const debouncedUpdate = useCallback((newValue: number, newUnit: Unit) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      onChange({ value: newValue, unit: newUnit });
    }, 300); // 300ms debounce delay
  }, [onChange]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Check if the unit is valid for the current options
  const mapUnit = (unit: Unit): Unit => {
    // Check if the unit is already in the options
    const exactMatch = unitOptions.find(option => option.value === unit);
    if (exactMatch) return unit;
    
    // Default to the first option if no match is found
    console.warn(`Unit ${unit} not found in options, using default`);
    return unitOptions.length > 0 ? unitOptions[0].value : unit;
  };

  // Ensure the unit is valid for the current options
  const currentUnit = mapUnit(localUnit);

  // Handle value change (numeric or clock) - now updates local state immediately
  const handleValueChange = (newValue: number) => {
    const newValueStr = newValue.toString();
    setLocalValue(newValueStr);
    
    // Debounce the update to parent
    debouncedUpdate(newValue, currentUnit);
  };

  // Handle input text change - updates local state immediately
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValueStr = event.target.value;
    setLocalValue(newValueStr);
    
    // Parse and debounce the update to parent
    const newValue = Number(newValueStr);
    if (!isNaN(newValue)) {
      debouncedUpdate(newValue, currentUnit);
    }
  };

  // Handle unit change with conversion
  const handleUnitChange = (event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }) => {
    const newUnit = event.target.value as Unit;
    const oldUnit = currentUnit;
    
    setLocalUnit(newUnit);
    
    // Only convert if units are different and we have a valid current value
    const currentValue = Number(localValue);
    if (newUnit !== oldUnit && !isNaN(currentValue)) {
      // Convert the value from old unit to new unit
      const convertedValue = convertUnit(currentValue, oldUnit, newUnit);
      
      // Round to 4 decimal places for better display
      const roundedValue = Math.round(convertedValue * 10000) / 10000;
      const roundedValueStr = roundedValue.toString();
      
      setLocalValue(roundedValueStr);
      
      // Notify parent immediately with converted value (no debounce for unit changes)
      onChange({ value: roundedValue, unit: newUnit });
      
      // Show the tooltip notification
      enqueueSnackbar(
        t('unitConversionDescription'), 
        { 
          variant: 'info',
          autoHideDuration: 3000,
          anchorOrigin: { vertical: 'bottom', horizontal: 'center' }
        }
      );
    } else {
      // Just update the unit without conversion
      onChange({ value: Number(localValue) || 0, unit: newUnit });
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        {label && (
          <Typography 
            component="label" 
            variant="body2" 
            sx={{ mr: 1, mb: 0, minWidth: 'fit-content' }}
          >
            {label}
          </Typography>
        )}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          width: '100%', 
          minWidth: 0, 
          maxWidth: '100%', 
          overflow: 'hidden' 
        }}>
          {currentUnit === 'CLOCK' ? (
            <>
              <Box sx={{ flex: 1, mr: 1, minWidth: 0, maxWidth: '100%' }}>
                <ClockTimePicker
                  value={typeof value.value === 'number' ? value.value : 12}
                  onChange={handleValueChange}
                />
              </Box>
              <Box sx={{ flexShrink: 0, minWidth: 0, maxWidth: '100%' }}>
                <FormControl size="small" fullWidth>
                  <StyledSelect
                    value={currentUnit}
                    onChange={handleUnitChange}
                    displayEmpty
                    inputRef={valueInputRef}
                  >
                    {unitOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Box>
            </>
          ) : (
            <>
              <StyledTextField
                type="number"
                value={localValue}
                onChange={handleInputChange}
                disabled={disabled}
                size="small"
                inputProps={{
                  min: inputProps.min as number | undefined,
                  max: inputProps.max as number | undefined,
                  step: inputProps.step ? inputProps.step.toString() : 'any',
                  ...inputProps,
                  ref: inputRef || valueInputRef,
                }}
                fullWidth
              />
              <Box sx={{ flexShrink: 0, minWidth: 0, maxWidth: '100%' }}>
                <FormControl size="small" fullWidth>
                  <StyledSelect
                    value={currentUnit}
                    onChange={handleUnitChange}
                    displayEmpty
                  >
                    {unitOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default memo(MeasurementInput);
