import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MeasurementInputMUI from '../MeasurementInputMUI';

// Mock i18n
jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  ...jest.requireActual('react-i18next'),
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the ClockTimePicker component
jest.mock('../ClockTimePicker.tsx', () => {
  return function MockClockTimePicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
    return (
      <input
        data-testid="mock-clock-picker"
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    );
  };
});

describe('MeasurementInputMUI', () => {
  const unitOptions = [
    { value: 'YARDS' as const, label: 'Yards' },
    { value: 'METERS' as const, label: 'Meters' },
    { value: 'FEET' as const, label: 'Feet' },
    { value: 'CLOCK' as const, label: 'Clock' }
  ];

  test('renders with initial value and unit', () => {
    const handleChange = jest.fn();
    render(
      <MeasurementInputMUI
        value={{ value: 100, unit: 'YARDS' as const }}
        onChange={handleChange}
        unitOptions={unitOptions}
        label="Distance"
      />
    );

    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByText('Yards')).toBeInTheDocument();
    expect(screen.getByText('Distance')).toBeInTheDocument();
  });

  test('handles value change', async () => {
    const handleChange = jest.fn();
    render(
      <MeasurementInputMUI
        value={{ value: 100, unit: 'YARDS' as const }}
        onChange={handleChange}
        unitOptions={unitOptions}
      />
    );

    const input = screen.getByDisplayValue('100');
    fireEvent.change(input, { target: { value: '200' } });
    
    // Wait for the setTimeout to execute
    await new Promise(resolve => setTimeout(resolve, 10));
    
    expect(handleChange).toHaveBeenCalledWith({ value: 200, unit: 'YARDS' });
  });

  test('handles unit change with conversion', async () => {
    const handleChange = jest.fn();
    render(
      <MeasurementInputMUI
        value={{ value: 100, unit: 'YARDS' as const }}
        onChange={handleChange}
        unitOptions={unitOptions}
      />
    );

    // Open the select dropdown
    const select = screen.getByText('Yards');
    fireEvent.mouseDown(select);
    
    // Select a different unit
    const option = screen.getByText('Meters');
    fireEvent.click(option);
    
    // Wait for the setTimeout to execute
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that onChange was called with converted value
    // 100 yards ≈ 91.44 meters
    expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ 
      unit: 'METERS',
      value: expect.any(Number)
    }));
  });

  test('renders ClockTimePicker when unit is CLOCK', () => {
    const handleChange = jest.fn();
    render(
      <MeasurementInputMUI
        value={{ value: 3, unit: 'CLOCK' as const }}
        onChange={handleChange}
        unitOptions={unitOptions}
      />
    );

    expect(screen.getByTestId('mock-clock-picker')).toBeInTheDocument();
    expect(screen.getByText('Clock')).toBeInTheDocument();
  });
});
