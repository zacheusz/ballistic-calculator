import React, { useState, useEffect } from 'react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
import dayjs, { Dayjs } from 'dayjs';
import { styled } from '@mui/material/styles';
import { ClockTimePickerProps } from '../types/componentTypes';

// Using shared ClockTimePickerProps interface from componentTypes.ts

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

const ClockTimePicker: React.FC<ClockTimePickerProps> = ({ value, onChange }) => {
  // Convert clock value (decimal, 1-12) to a time
  const clockToTime = (clockValue: number): Dayjs => {
    // Accept decimals (e.g., 5.5 for 5:30)
    let hour = Math.floor(clockValue);
    let minute = Math.round((clockValue - hour) * 60);
    if (hour === 12) hour = 0;
    return dayjs().hour(hour).minute(minute);
  };

  // Convert time back to clock position (1-12, decimal)
  const timeToClock = (time: Dayjs | null): number => {
    if (!time) return 12;
    let hour = time.hour();
    let minute = time.minute();
    // Map hours back to clock positions (0 hours = 12 o'clock, 3 hours = 3 o'clock, etc.)
    let clockHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    let clockValue = clockHour + (minute / 60);
    // Clamp to [1,12]
    if (clockValue < 1) clockValue = 12;
    if (clockValue > 12) clockValue = clockValue % 12;
    return clockValue;
  };

  // We don't need to format the time for display as MUI TimePicker handles this

  const [time, setTime] = useState<Dayjs>(clockToTime(value || 12));

  // Update time when value changes externally
  useEffect(() => {
    setTime(clockToTime(value || 12));
  }, [value]);

  const handleTimeChange = (newTime: Dayjs | null) => {
    if (newTime) {
      setTime(newTime);
      // For wind direction, use hour + minute/60 as decimal
      const clockValue = timeToClock(newTime);
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
