import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ShotComponent from '../ShotComponent';

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

// Mock the WindSegmentComponent
jest.mock('../WindSegmentComponent', () => {
  return function MockWindSegmentComponent({ windSegments }) {
    return <div data-testid="mock-wind-segment">Wind Segments: {windSegments.length}</div>;
  };
});

describe('ShotComponent', () => {
  const defaultProps = {
    values: {
      shot: {
        range: { value: 100, unit: 'YARDS' },
        elevationAngle: { value: 0, unit: 'DEGREES' },
        azimuth: { value: 0, unit: 'DEGREES' },
        latitude: { value: 0, unit: 'DEGREES' },
        windSegments: [
          {
            maxRange: { value: 1000, unit: 'YARDS' },
            speed: { value: 10, unit: 'MILES_PER_HOUR' },
            direction: { value: 3, unit: 'CLOCK' },
            verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' }
          }
        ]
      }
    },
    handleBlur: jest.fn(),
    handleShotChange: jest.fn(),
    setFieldValue: jest.fn(),
    loading: false,
    errors: {},
    touched: {},
    calculationOptions: {
      calculateCoriolisEffect: false
    },
    rangeInputRef: { current: null },
    elevationAngleInputRef: { current: null },
    getWindSegmentRef: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with correct initial values', () => {
    render(<ShotComponent {...defaultProps} />);
    
    // Check that the component renders with the correct title
    expect(screen.getByText('calcShot')).toBeInTheDocument();
    
    // Check that range field is rendered with correct value
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
    expect(screen.getByText('unitYards')).toBeInTheDocument();
    
    // Check that elevation angle field is rendered with correct value
    expect(screen.getByDisplayValue('0')).toBeInTheDocument();
    expect(screen.getByText('unitDegrees')).toBeInTheDocument();
    
    // Check that wind segment component is rendered
    expect(screen.getByTestId('mock-wind-segment')).toBeInTheDocument();
    expect(screen.getByText('Wind Segments: 1')).toBeInTheDocument();
  });

  test('calls setFieldValue and handleShotChange when range value is changed', async () => {
    render(<ShotComponent {...defaultProps} />);
    
    // Find the input field for range
    const rangeInput = screen.getByDisplayValue('100');
    
    // Change the value
    fireEvent.change(rangeInput, { target: { value: '200' } });
    
    // Wait for any debounce or timeout
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that setFieldValue and handleShotChange were called with the correct values
    expect(defaultProps.setFieldValue).toHaveBeenCalledWith(
      'shot.range', 
      expect.objectContaining({ 
        value: 200, 
        unit: 'YARDS' 
      })
    );
    expect(defaultProps.handleShotChange).toHaveBeenCalledWith(
      'range', 
      expect.objectContaining({ 
        value: 200, 
        unit: 'YARDS' 
      })
    );
  });

  test('calls handleShotChange when elevation angle value is changed', async () => {
    render(<ShotComponent {...defaultProps} />);
    
    // Find the input field for elevation angle
    const elevationAngleInput = screen.getByDisplayValue('0');
    
    // Change the value
    fireEvent.change(elevationAngleInput, { target: { value: '10' } });
    
    // Wait for any debounce or timeout
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that handleShotChange was called with the correct value
    expect(defaultProps.handleShotChange).toHaveBeenCalledWith(
      'elevationAngle', 
      expect.objectContaining({ 
        value: 10, 
        unit: 'DEGREES' 
      })
    );
  });

  test('shows Coriolis effect fields when calculateCoriolisEffect is true', () => {
    render(<ShotComponent {...defaultProps} calculationOptions={{ calculateCoriolisEffect: true }} />);
    
    // Check that azimuth and latitude fields are rendered
    expect(screen.getByText('shotAzimuth')).toBeInTheDocument();
    expect(screen.getByText('shooterLatitude')).toBeInTheDocument();
  });

  test('does not show Coriolis effect fields when calculateCoriolisEffect is false', () => {
    render(<ShotComponent {...defaultProps} />);
    
    // Check that azimuth and latitude fields are not rendered
    expect(screen.queryByText('shotAzimuth')).not.toBeInTheDocument();
    expect(screen.queryByText('shooterLatitude')).not.toBeInTheDocument();
  });

  test('shows validation error when there is an error and the field has been touched', () => {
    const propsWithError = {
      ...defaultProps,
      errors: {
        shot: {
          range: {
            value: 'Range is required'
          }
        }
      },
      touched: {
        shot: {
          range: {
            value: true
          }
        }
      }
    };
    
    render(<ShotComponent {...propsWithError} />);
    
    // Check that the error message is displayed
    expect(screen.getByText('Range is required')).toBeInTheDocument();
  });

  test('disables all inputs when loading is true', () => {
    render(<ShotComponent {...defaultProps} loading={true} />);
    
    // Check that all inputs are disabled
    const inputs = screen.getAllByRole('textbox');
    inputs.forEach(input => {
      expect(input).toBeDisabled();
    });
  });
});
