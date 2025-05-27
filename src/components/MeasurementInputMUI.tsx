
import React, { useRef, useState, useEffect } from 'react';
import { 
  TextField, 
  Select, 
  MenuItem, 
  FormControl, 
  Box,
  Typography,
  Tooltip,
  Fade,
  styled
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { convertUnit } from '../utils/unitConversion';
import ClockTimePicker from './ClockTimePicker.tsx';
import { Measurement, Unit } from '../types/ballistics';
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

const MeasurementInputMUI: React.FC<MeasurementInputProps> = ({
  value,
  onChange,
  unitOptions,
  label,
  disabled,
  inputProps = {},
}) => {
  const { t } = useTranslation();
  const valueInputRef = useRef<HTMLInputElement>(null);
  const [localMeasurement, setLocalMeasurement] = useState<Measurement>(value);
  const [showTooltip, setShowTooltip] = useState(false);

  // Check if the unit is valid for the current options
  const mapUnit = (unit: Unit): Unit => {
    // Check if the unit is already in the options
    const exactMatch = unitOptions.find(option => option.value === unit);
    if (exactMatch) return unit;
    
    // Default to the first option if no match is found
    console.warn(`Unit ${unit} not found in options, using default`);
    return unitOptions.length > 0 ? unitOptions[0].value : unit;
  };

  // Sync local state with props
  useEffect(() => {
    if (value.value !== localMeasurement.value || value.unit !== localMeasurement.unit) {
      // Map the unit if needed
      const mappedUnit = mapUnit(value.unit);
      setLocalMeasurement({
        ...value,
        unit: mappedUnit
      });
    }
  }, [value, unitOptions]);

  // Handle value change (numeric or clock)
  const handleValueChange = (newValue: number) => {
    const updated = { ...localMeasurement, value: newValue };
    setLocalMeasurement(updated);
    
    // Notify parent in the next tick to avoid React state update during render
    setTimeout(() => {
      onChange(updated);
    }, 0);
  };

  // Handle unit change with conversion
  const handleUnitChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newUnit = event.target.value as Unit;
    const oldUnit = localMeasurement.unit;
    
    // Only convert if units are different and we have a valid current value
    if (newUnit !== oldUnit && localMeasurement.value !== undefined && !isNaN(localMeasurement.value)) {
      // Convert the value from old unit to new unit
      const convertedValue = convertUnit(localMeasurement.value, oldUnit, newUnit);
      
      // Round to 4 decimal places for better display
      const roundedValue = Math.round(convertedValue * 10000) / 10000;
      
      // Update local state
      const updated = { value: roundedValue, unit: newUnit };
      setLocalMeasurement(updated);
      
      // Notify parent in the next tick to avoid React state update during render
      setTimeout(() => {
        onChange(updated);
      }, 0);
      
      // Show the tooltip notification
      setShowTooltip(true);
      
      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
    } else {
      // Just update the unit without conversion
      const updated = { ...localMeasurement, unit: newUnit };
      setLocalMeasurement(updated);
      
      // Notify parent in the next tick to avoid React state update during render
      setTimeout(() => {
        onChange(updated);
      }, 0);
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
          {localMeasurement.unit === 'CLOCK' ? (
            <>
              <Box sx={{ flex: 1, mr: 1, minWidth: 0, maxWidth: '100%' }}>
                <ClockTimePicker
                  value={typeof localMeasurement.value === 'number' ? localMeasurement.value : 12}
                  onChange={handleValueChange}
                />
              </Box>
              <Box sx={{ flexShrink: 0, minWidth: 0, maxWidth: '100%' }}>
                <FormControl size="small" fullWidth>
                  <StyledSelect
                    value={localMeasurement.unit}
                    onChange={handleUnitChange as any}
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
                value={localMeasurement.value.toString()}
                onChange={e => handleValueChange(Number(e.target.value))}
                disabled={disabled}
                size="small"
                inputProps={{
                  min: inputProps.min as number | undefined,
                  max: inputProps.max as number | undefined,
                  step: inputProps.step ? inputProps.step.toString() : 'any',
                  ...inputProps,
                  ref: valueInputRef,
                }}
                fullWidth
              />
              <Box sx={{ flexShrink: 0, minWidth: 0, maxWidth: '100%' }}>
                <FormControl size="small" fullWidth>
                  <StyledSelect
                    value={localMeasurement.unit}
                    onChange={handleUnitChange as any}
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

      {/* Tooltip for unit conversion notification */}
      <Tooltip
        open={showTooltip}
        title={
          <Box sx={{ p: 1 }}>
            <Typography variant="subtitle2" color="primary" sx={{ mb: 0.5 }}>
              {t('unitConversionNotice')}
            </Typography>
            <Typography variant="body2">
              {t('unitConversionDescription')}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {t('clickToDismiss')}
            </Typography>
          </Box>
        }
        placement="top"
        arrow
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 300 }}
        onClose={() => setShowTooltip(false)}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: 'background.paper',
              color: 'text.primary',
              boxShadow: 3,
              border: 1,
              borderColor: 'divider',
              maxWidth: 300,
              '& .MuiTooltip-arrow': {
                color: 'background.paper',
              },
            },
          },
        }}
      >
        <span style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: showTooltip ? 'auto' : 'none' }} />
      </Tooltip>
    </Box>
  );
};

export default MeasurementInputMUI;
