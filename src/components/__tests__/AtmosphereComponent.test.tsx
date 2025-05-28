import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AtmosphereComponent from '../AtmosphereComponent';
import { Atmosphere, Measurement } from '../../types/ballistics';

// Mock i18n
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise<void>(() => {}),
      },
    };
  },
}));

describe('AtmosphereComponent', () => {
  interface AtmosphereComponentProps {
    values: {
      atmosphere: Atmosphere;
    };
    handleBlur: (e: React.FocusEvent<any>) => void;
    handleChange: (e: React.ChangeEvent<any>) => void;
    handleAtmosphereChange: (field: string, value: Measurement) => void;
    handleAtmosphereSimpleChange: (field: string, value: string | number) => void;
    loading: boolean;
    temperatureInputRef: React.RefObject<HTMLInputElement>;
    pressureInputRef: React.RefObject<HTMLInputElement>;
    altitudeInputRef: React.RefObject<HTMLInputElement>;
  }

  const defaultProps: AtmosphereComponentProps = {
    values: {
      atmosphere: {
        temperature: { value: 59, unit: 'FAHRENHEIT' },
        pressure: { value: 29.92, unit: 'INCHES_MERCURY' },
        pressureType: 'STATION',
        humidity: 50,
        altitude: { value: 0, unit: 'FEET' }
      }
    },
    handleBlur: jest.fn(),
    handleChange: jest.fn(),
    handleAtmosphereChange: jest.fn(),
    handleAtmosphereSimpleChange: jest.fn(),
    loading: false,
    temperatureInputRef: { current: null } as unknown as React.RefObject<HTMLInputElement>,
    pressureInputRef: { current: null } as unknown as React.RefObject<HTMLInputElement>,
    altitudeInputRef: { current: null } as unknown as React.RefObject<HTMLInputElement>
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct initial values', () => {
    render(<AtmosphereComponent {...defaultProps} />);
    
    // Check that the component renders with the correct title
    expect(screen.getByText('calcAtmosphere')).toBeInTheDocument();
    
    // Check that temperature field is rendered with correct value
    expect(screen.getByDisplayValue('59')).toBeInTheDocument();
    expect(screen.getByText('unitFahrenheit')).toBeInTheDocument();
    
    // Check that pressure field is rendered with correct value
    expect(screen.getByDisplayValue('29.92')).toBeInTheDocument();
    expect(screen.getByText('unitInHg')).toBeInTheDocument();
    
    // Check that pressure type select is rendered with correct value
    expect(screen.getByText('calcStationPressure')).toBeInTheDocument();
    
    // Check that humidity field is rendered with correct value
    expect(screen.getByDisplayValue('50')).toBeInTheDocument();
    
    // Check that altitude field is rendered with correct value
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    expect(screen.getByText('unitFeet')).toBeInTheDocument();
  });

  test('calls handleAtmosphereChange when temperature value is changed', async () => {
    render(<AtmosphereComponent {...defaultProps} />);
    
    // Find the input field for temperature
    const temperatureInput = screen.getByDisplayValue('59');
    
    // Change the value
    fireEvent.change(temperatureInput, { target: { value: '70' } });
    
    // Wait for any debounce or timeout
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that handleAtmosphereChange was called with the correct value
    expect(defaultProps.handleAtmosphereChange).toHaveBeenCalledWith(
      'temperature', 
      expect.objectContaining({ 
        value: 70, 
        unit: 'FAHRENHEIT' 
      })
    );
  });

  test('calls handleAtmosphereChange when pressure value is changed', async () => {
    render(<AtmosphereComponent {...defaultProps} />);
    
    // Find the input field for pressure
    const pressureInput = screen.getByDisplayValue('29.92');
    
    // Change the value
    fireEvent.change(pressureInput, { target: { value: '30.5' } });
    
    // Wait for any debounce or timeout
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that handleAtmosphereChange was called with the correct value
    expect(defaultProps.handleAtmosphereChange).toHaveBeenCalledWith(
      'pressure', 
      expect.objectContaining({ 
        value: 30.5, 
        unit: 'INCHES_MERCURY' 
      })
    );
  });

  test('calls handleAtmosphereSimpleChange when pressure type is changed', () => {
    render(<AtmosphereComponent {...defaultProps} />);
    
    // Find the select for pressure type by looking for the select element with Station Pressure value
    const pressureTypeSelects = screen.getAllByRole('combobox');
    const pressureTypeSelect = pressureTypeSelects.find(select => 
      select.textContent?.includes('calcStationPressure') || 
      select.innerHTML?.includes('calcStationPressure')
    ) || pressureTypeSelects[2]; // Fallback to the third combobox which is likely the pressure type
    
    // Open the select dropdown
    fireEvent.mouseDown(pressureTypeSelect);
    
    // Select a different pressure type
    const option = screen.getByText('calcBarometricPressure');
    fireEvent.click(option);
    
    // Check that handleChange and handleAtmosphereSimpleChange were called with the correct values
    expect(defaultProps.handleChange).toHaveBeenCalled();
    expect(defaultProps.handleAtmosphereSimpleChange).toHaveBeenCalledWith('pressureType', 'BAROMETRIC');
  });

  test('calls handleAtmosphereSimpleChange when humidity is changed', () => {
    render(<AtmosphereComponent {...defaultProps} />);
    
    // Find the input field for humidity
    const humidityInput = screen.getByDisplayValue('50');
    
    // Change the value
    fireEvent.change(humidityInput, { target: { value: '60' } });
    
    // Check that handleChange and handleAtmosphereSimpleChange were called with the correct values
    expect(defaultProps.handleChange).toHaveBeenCalled();
    expect(defaultProps.handleAtmosphereSimpleChange).toHaveBeenCalledWith('humidity', 60);
  });

  test('calls handleAtmosphereChange when altitude value is changed', async () => {
    render(<AtmosphereComponent {...defaultProps} />);
    
    // Find the input field for altitude
    const altitudeInput = screen.getByDisplayValue('0');
    
    // Change the value
    fireEvent.change(altitudeInput, { target: { value: '1000' } });
    
    // Wait for any debounce or timeout
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that handleAtmosphereChange was called with the correct value
    expect(defaultProps.handleAtmosphereChange).toHaveBeenCalledWith(
      'altitude', 
      expect.objectContaining({ 
        value: 1000, 
        unit: 'FEET' 
      })
    );
  });

  test('disables all inputs when loading is true', () => {
    // Re-render with loading=true
    const propsWithLoading = {
      ...defaultProps,
      loading: true
    };
    
    render(<AtmosphereComponent {...propsWithLoading} />);
    
    // Get all the MeasurementInputMUI components which should be disabled
    // We need to check the MUI components' disabled state which might not be directly on the input
    const temperatureInput = screen.getByDisplayValue('59');
    const pressureInput = screen.getByDisplayValue('29.92');
    const altitudeInput = screen.getByDisplayValue('0');
    
    // Check that these specific inputs are disabled
    expect(temperatureInput).toBeDisabled();
    expect(pressureInput).toBeDisabled();
    expect(altitudeInput).toBeDisabled();
    
    // For MUI components, we don't need to check the exact class name as it may vary
    // Instead, we'll verify that the component is disabled by checking if the inputs are disabled
    // which we already did above
  });
});
