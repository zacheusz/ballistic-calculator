/* eslint-env jest */
/* global jest, describe, test, expect, beforeEach */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AtmosphereComponent from '../AtmosphereComponent';

// Mock i18n
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

describe('AtmosphereComponent', () => {
  const defaultProps = {
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
    temperatureInputRef: { current: null },
    pressureInputRef: { current: null },
    altitudeInputRef: { current: null }
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
    
    // Find the select for pressure type
    const pressureTypeSelect = screen.getByRole('button', { name: /calcStationPressure/i });
    
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
    render(<AtmosphereComponent {...defaultProps} loading={true} />);
    
    // Check that all inputs are disabled
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
    
    const selects = screen.getAllByRole('button');
    selects.forEach(select => {
      expect(select).toHaveAttribute('aria-disabled', 'true');
    });
  });
});
