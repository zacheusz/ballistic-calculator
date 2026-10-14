import React from 'react';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import MeasurementInput from '../MeasurementInput';
import type { Measurement } from '../../types/ballistics';

jest.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar: jest.fn() }),
}));

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

describe('MeasurementInput', () => {
  beforeEach(() => jest.useFakeTimers());

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  const unitOptions = [
    { value: 'YARDS' as const, label: 'Yards' },
    { value: 'METERS' as const, label: 'Meters' },
    { value: 'FEET' as const, label: 'Feet' },
    { value: 'CLOCK' as const, label: 'Clock' }
  ];

  test('renders with initial value and unit', () => {
    const handleChange = jest.fn();
    render(
      <MeasurementInput
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

  test('handles value change after the debounce delay', () => {
    const handleChange = jest.fn();
    render(
      <MeasurementInput
        value={{ value: 100, unit: 'YARDS' as const }}
        onChange={handleChange}
        unitOptions={unitOptions}
        label="Distance"
      />
    );

    const input = screen.getByDisplayValue('100');
    fireEvent.change(input, { target: { value: '200' } });
    
    act(() => jest.advanceTimersByTime(299));
    expect(handleChange).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    
    expect(handleChange).toHaveBeenCalledWith({ value: 200, unit: 'YARDS' });
  });

  test('handles unit change with conversion immediately', () => {
    const handleChange = jest.fn();
    render(
      <MeasurementInput
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
    
    expect(handleChange).toHaveBeenCalledWith({ value: 91.44, unit: 'METERS' });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  test('only publishes the latest of several rapid numeric edits', () => {
    const handleChange = jest.fn();
    render(<MeasurementInput value={{ value: 100, unit: 'YARDS' }} onChange={handleChange} unitOptions={unitOptions} />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '200' } });
    act(() => jest.advanceTimersByTime(200));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '300' } });
    act(() => jest.advanceTimersByTime(299));
    expect(handleChange).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(1));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenLastCalledWith({ value: 300, unit: 'YARDS' });
  });

  test('a unit selection supersedes a pending numeric edit in a controlled input', () => {
    const handleChange = jest.fn();
    const ControlledInput = () => {
      const [value, setValue] = React.useState<Measurement>({ value: 100, unit: 'YARDS' });
      return <MeasurementInput value={value} unitOptions={unitOptions} onChange={next => {
        handleChange(next);
        setValue(next);
      }} />;
    };
    render(<ControlledInput />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '200' } });
    act(() => jest.advanceTimersByTime(100));
    fireEvent.mouseDown(screen.getByText('Yards'));
    fireEvent.click(screen.getByRole('option', { name: 'Meters' }));
    expect(handleChange).toHaveBeenLastCalledWith({ value: 182.88, unit: 'METERS' });

    act(() => jest.advanceTimersByTime(300));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('spinbutton')).toHaveValue(182.88);
    expect(screen.getByRole('combobox')).toHaveTextContent('Meters');

    // A subsequent edit must still debounce normally, using the newly selected unit.
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '250' } });
    act(() => jest.advanceTimersByTime(300));
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(handleChange).toHaveBeenLastCalledWith({ value: 250, unit: 'METERS' });
  });

  test.each<Measurement>([
    { value: 50, unit: 'YARDS' },
    { value: 100, unit: 'METERS' },
  ])('an external value change cancels an older edit: %j', replacement => {
    const handleChange = jest.fn();
    const { rerender } = render(<MeasurementInput value={{ value: 100, unit: 'YARDS' }} onChange={handleChange} unitOptions={unitOptions} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '200' } });
    act(() => jest.advanceTimersByTime(100));

    rerender(<MeasurementInput value={replacement} onChange={handleChange} unitOptions={unitOptions} />);
    act(() => jest.advanceTimersByTime(300));
    expect(handleChange).not.toHaveBeenCalled();
    expect(screen.getByRole('spinbutton')).toHaveValue(replacement.value);
    expect(screen.getByRole('combobox')).toHaveTextContent(replacement.unit === 'YARDS' ? 'Yards' : 'Meters');
  });

  test('unit selection cancels the old edit even before the parent echoes the value', () => {
    const handleChange = jest.fn();
    render(<MeasurementInput value={{ value: 100, unit: 'YARDS' }} onChange={handleChange} unitOptions={unitOptions} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '200' } });
    fireEvent.mouseDown(screen.getByText('Yards'));
    fireEvent.click(screen.getByRole('option', { name: 'Meters' }));

    act(() => jest.advanceTimersByTime(300));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenLastCalledWith({ value: 182.88, unit: 'METERS' });
    expect(screen.getByRole('spinbutton')).toHaveValue(182.88);
  });

  test('an equivalent value object does not discard a pending edit', () => {
    const handleChange = jest.fn();
    const { rerender } = render(<MeasurementInput value={{ value: 100, unit: 'YARDS' }} onChange={handleChange} unitOptions={unitOptions} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '200' } });
    rerender(<MeasurementInput value={{ value: 100, unit: 'YARDS' }} onChange={handleChange} unitOptions={unitOptions} />);
    act(() => jest.advanceTimersByTime(300));
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenLastCalledWith({ value: 200, unit: 'YARDS' });
  });

  test('unmounting cancels a pending edit', () => {
    const handleChange = jest.fn();
    const { unmount } = render(<MeasurementInput value={{ value: 100, unit: 'YARDS' }} onChange={handleChange} unitOptions={unitOptions} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '200' } });
    unmount();
    act(() => jest.advanceTimersByTime(300));
    expect(handleChange).not.toHaveBeenCalled();
  });

  test('renders ClockTimePicker when unit is CLOCK', () => {
    const handleChange = jest.fn();
    render(
      <MeasurementInput
        value={{ value: 3, unit: 'CLOCK' as const }}
        onChange={handleChange}
        unitOptions={unitOptions}
      />
    );

    expect(screen.getByTestId('mock-clock-picker')).toBeInTheDocument();
    expect(screen.getByText('Clock')).toBeInTheDocument();
  });
});
