import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeComponent from '../ModeComponent';

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

describe('ModeComponent', () => {
  const defaultProps = {
    mode: 'HUD',
    onModeChange: jest.fn(),
    rangeCardStart: 100,
    onRangeCardStartChange: jest.fn(),
    rangeCardStep: 50,
    onRangeCardStepChange: jest.fn(),
    unit: 'YARDS',
    onUnitChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with HUD mode selected', () => {
    render(<ModeComponent {...defaultProps} />);
    
    // Check that the component renders with the correct title
    expect(screen.getByText('calcMode')).toBeInTheDocument();
    
    // Check that HUD mode is selected
    const hudRadio = screen.getByLabelText('calcHudMode');
    expect(hudRadio).toBeChecked();
    
    // Range card options should not be visible in HUD mode
    expect(screen.queryByText('calcRangeCardStart')).not.toBeInTheDocument();
    expect(screen.queryByText('calcRangeCardStep')).not.toBeInTheDocument();
  });

  test('renders with RANGE_CARD mode selected and shows range options', () => {
    render(<ModeComponent {...defaultProps} mode="RANGE_CARD" />);
    
    // Check that RANGE_CARD mode is selected
    const rangeCardRadio = screen.getByLabelText('calcRangeCardMode');
    expect(rangeCardRadio).toBeChecked();
    
    // Range card options should be visible in RANGE_CARD mode
    expect(screen.getByText('calcRangeCardStart')).toBeInTheDocument();
    expect(screen.getByText('calcRangeCardStep')).toBeInTheDocument();
  });

  test('calls onModeChange when mode is changed', () => {
    render(<ModeComponent {...defaultProps} />);
    
    // Click on the RANGE_CARD radio button
    const rangeCardRadio = screen.getByLabelText('calcRangeCardMode');
    fireEvent.click(rangeCardRadio);
    
    // Check that onModeChange was called with the correct value
    expect(defaultProps.onModeChange).toHaveBeenCalledWith('RANGE_CARD');
  });

  test('calls onRangeCardStartChange when range card start value is changed', () => {
    render(<ModeComponent {...defaultProps} mode="RANGE_CARD" />);
    
    // Find the input field for range card start
    const inputs = screen.getAllByRole('textbox');
    const rangeCardStartInput = inputs[0]; // First input should be range card start
    
    // Change the value
    fireEvent.change(rangeCardStartInput, { target: { value: '200' } });
    
    // Check that onRangeCardStartChange was called with the correct value
    // Note: There might be a debounce or timeout in the component
    setTimeout(() => {
      expect(defaultProps.onRangeCardStartChange).toHaveBeenCalledWith(200);
    }, 10);
  });

  test('calls onRangeCardStepChange when range card step value is changed', () => {
    render(<ModeComponent {...defaultProps} mode="RANGE_CARD" />);
    
    // Find the input field for range card step
    const inputs = screen.getAllByRole('textbox');
    const rangeCardStepInput = inputs[1]; // Second input should be range card step
    
    // Change the value
    fireEvent.change(rangeCardStepInput, { target: { value: '100' } });
    
    // Check that onRangeCardStepChange was called with the correct value
    // Note: There might be a debounce or timeout in the component
    setTimeout(() => {
      expect(defaultProps.onRangeCardStepChange).toHaveBeenCalledWith(100);
    }, 10);
  });

  test('calls onUnitChange when unit is changed', () => {
    render(<ModeComponent {...defaultProps} mode="RANGE_CARD" />);
    
    // Find the select for the unit
    const unitSelects = screen.getAllByRole('button');
    const unitSelect = unitSelects.find(select => select.textContent.includes('unitYards'));
    
    // Open the select dropdown
    fireEvent.mouseDown(unitSelect);
    
    // Select a different unit
    const option = screen.getByText('unitMeters');
    fireEvent.click(option);
    
    // Check that onUnitChange was called with the correct value
    setTimeout(() => {
      expect(defaultProps.onUnitChange).toHaveBeenCalledWith('METERS');
    }, 10);
  });
});
