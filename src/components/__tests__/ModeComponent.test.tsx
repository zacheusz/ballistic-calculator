import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeComponent from '../ModeComponent';
import { Unit } from '../../types/ballistics';
import { CalculationMode, RangeCardSettings } from '../../hooks/useCalculator';

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

describe('ModeComponent', () => {
  interface ModeComponentProps {
    mode: CalculationMode;
    rangeCardSettings: RangeCardSettings;
    handleModeChange: (mode: CalculationMode) => void;
    handleRangeCardSettingChange: (field: keyof RangeCardSettings, value: any) => void;
    loading: boolean;
  }

  const defaultProps: ModeComponentProps = {
    mode: 'HUD',
    rangeCardSettings: {
      start: 100,
      step: 50,
      unit: 'YARDS' as Unit
    },
    handleModeChange: jest.fn(),
    handleRangeCardSettingChange: jest.fn(),
    loading: false
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

  test('calls handleModeChange when mode is changed', () => {
    render(<ModeComponent {...defaultProps} />);
    
    // Click on the RANGE_CARD radio button
    const rangeCardRadio = screen.getByLabelText('calcRangeCardMode');
    fireEvent.click(rangeCardRadio);
    
    // Check that handleModeChange was called with the correct value
    expect(defaultProps.handleModeChange).toHaveBeenCalledWith('RANGE_CARD');
  });

  test('calls handleRangeCardSettingChange when range card start value is changed', async () => {
    render(<ModeComponent {...defaultProps} mode="RANGE_CARD" />);
    
    // Find the input field for range card start by looking for number inputs instead of textbox
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
    const rangeCardStartInput = inputs[0]; // First input should be range card start
    
    // Change the value
    fireEvent.change(rangeCardStartInput, { target: { value: '200' } });
    
    // Wait for any debounce or timeout
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that handleRangeCardSettingChange was called with the correct value
    expect(defaultProps.handleRangeCardSettingChange).toHaveBeenCalledWith('start', 200);
  });

  test('calls handleRangeCardSettingChange when range card step value is changed', async () => {
    render(<ModeComponent {...defaultProps} mode="RANGE_CARD" />);
    
    // Find the input field for range card step by looking for number inputs instead of textbox
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(1);
    const rangeCardStepInput = inputs[1]; // Second input should be range card step
    
    // Change the value
    fireEvent.change(rangeCardStepInput, { target: { value: '100' } });
    
    // Wait for any debounce or timeout
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that handleRangeCardSettingChange was called with the correct value
    expect(defaultProps.handleRangeCardSettingChange).toHaveBeenCalledWith('step', 100);
  });

  test('calls handleRangeCardSettingChange when unit is changed', async () => {
    render(<ModeComponent {...defaultProps} mode="RANGE_CARD" />);
    
    // Find all comboboxes which are the unit selectors in MUI
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes.length).toBeGreaterThan(0);
    
    // Get the first combobox which should be the unit selector
    const unitSelect = comboboxes[0];
    
    // Open the select dropdown
    fireEvent.mouseDown(unitSelect);
    
    // Wait for dropdown to open
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Select a different unit
    const option = screen.getByText('unitMeters');
    fireEvent.click(option);
    
    // Wait for any debounce or timeout
    await new Promise(resolve => setTimeout(resolve, 10));
    
    // Check that handleRangeCardSettingChange was called with the correct value
    expect(defaultProps.handleRangeCardSettingChange).toHaveBeenCalledWith('unit', 'METERS');
  });
});
