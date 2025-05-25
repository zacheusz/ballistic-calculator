import React, { useState, useEffect } from 'react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs from 'dayjs';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

// Styled component to match Bootstrap styling
const StyledTimePicker = styled(TimePicker)(() => ({
  '& .MuiInputBase-root': {
    borderRadius: '0.375rem',
    fontSize: '1rem',
    lineHeight: '1.5',
    height: 'calc(1.5em + 0.75rem + 2px)',
    padding: '0.375rem 0.75rem',
    overflow: 'hidden', // Prevent content overflow
  },
  '& .MuiInputLabel-root': {
    display: 'none', // Hide the label to prevent overflow
  },
  '& .MuiFormLabel-root': {
    display: 'none', // Hide any form labels
  },
  '& .MuiFormControl-root': {
    width: '100%', // Ensure the form control takes full width
  },
  width: '100%',
  marginRight: '0.5rem',
}));

const ClockTimePicker = ({ value, onChange }) => {
  // Convert clock value (1-12) to a time
  const clockToTime = (clockValue) => {
    // Map clock positions to hours (12 o'clock = 0 hours, 3 o'clock = 3 hours, etc.)
    const hour = clockValue === 12 ? 0 : clockValue;
    return dayjs().hour(hour).minute(0);
  };

  // Convert time back to clock position (1-12)
  const timeToClock = (time) => {
    if (!time) return 12;
    const hour = time.hour();
    // Map hours back to clock positions (0 hours = 12 o'clock, 3 hours = 3 o'clock, etc.)
    return hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  };
  
  // We don't need to format the time for display as MUI TimePicker handles this

  const [time, setTime] = useState(clockToTime(value || 12));

  // Update time when value changes externally
  useEffect(() => {
    setTime(clockToTime(value || 12));
  }, [value]);

  const handleTimeChange = (newTime) => {
    setTime(newTime);
    if (newTime) {
      // For wind direction, we're primarily interested in the hour hand position
      // as it corresponds to the clock position (1-12)
      const clockValue = timeToClock(newTime);
      
      // Pass the clock position value to the parent component
      onChange(clockValue);
    }
  };

  return (
    <StyledTimePicker
      value={time}
      onChange={handleTimeChange}
      viewRenderers={{
        hours: renderTimeViewClock,
        minutes: renderTimeViewClock,
      }}
      format="h:mm"
      ampm={true}
      slotProps={{
        textField: {
          size: "small",
          fullWidth: true,
          InputProps: {
            readOnly: true,
            style: { overflow: 'hidden' }
          },
          placeholder: "Clock Position",
          sx: { overflow: 'hidden' }
        },
        actionBar: {
          actions: ['accept'],
        },
        field: {
          clearable: false,
        }
      }}
      sx={{ minWidth: 120, overflow: 'hidden' }}
    />
  );
};

export default ClockTimePicker;
