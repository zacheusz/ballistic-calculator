
import React, { useRef } from 'react';
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
  const currentUnit = mapUnit(value.unit);

  // Handle value change (numeric or clock)
  const handleValueChange = (newValue: number) => {
    const updated = { ...value, value: newValue };
    
    // Notify parent immediately
    onChange(updated);
  };

  // Handle unit change with conversion
  const handleUnitChange = (event: React.ChangeEvent<HTMLInputElement> | { target: { value: unknown } }) => {
    const newUnit = event.target.value as Unit;
    const oldUnit = value.unit;
    
    // Only convert if units are different and we have a valid current value
    if (newUnit !== oldUnit && value.value !== undefined && !isNaN(value.value)) {
      // Convert the value from old unit to new unit
      const convertedValue = convertUnit(value.value, oldUnit, newUnit);
      
      // Round to 4 decimal places for better display
      const roundedValue = Math.round(convertedValue * 10000) / 10000;
      
      // Notify parent immediately with converted value
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
      onChange({ ...value, unit: newUnit });
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
                value={value.value.toString()}
                onChange={e => handleValueChange(Number(e.target.value))}
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

      {/* Tooltip removed in favor of global notification system */}
    </Box>
  );
};

export default MeasurementInput;
