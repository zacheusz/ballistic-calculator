import { render, screen, fireEvent } from '@testing-library/react';
import ModePanel from '../ModePanel';

describe('ModePanel', () => {
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
    render(<ModePanel {...defaultProps} />);
    
    // Check that the component renders with the correct title
    expect(screen.getByText('Mode')).toBeInTheDocument();
    
    // Check that HUD radio button is selected
    const hudRadio = screen.getByLabelText('HUD');
    expect(hudRadio).toBeInTheDocument();
    expect(hudRadio).toBeChecked();
    
    // Check that Range Card radio button is not selected
    const rangeCardRadio = screen.getByLabelText('Range Card');
    expect(rangeCardRadio).toBeInTheDocument();
    expect(rangeCardRadio).not.toBeChecked();
    
    // Range card settings should not be visible in HUD mode
    expect(screen.queryByText('Range Card Start')).not.toBeInTheDocument();
    expect(screen.queryByText('Range Card Step')).not.toBeInTheDocument();
  });

  test('renders with Range Card mode selected and shows additional settings', () => {
    render(<ModePanel {...defaultProps} mode="RANGE_CARD" />);
    
    // Check that Range Card radio button is selected
    const rangeCardRadio = screen.getByLabelText('Range Card');
    expect(rangeCardRadio).toBeChecked();
    
    // Range card settings should be visible
    expect(screen.getByText('Range Card Start')).toBeInTheDocument();
    expect(screen.getByText('Range Card Step')).toBeInTheDocument();
    
    // Check that the input fields have the correct values
    const startInput = screen.getByDisplayValue('100');
    expect(startInput).toBeInTheDocument();
    
    const stepInput = screen.getByDisplayValue('50');
    expect(stepInput).toBeInTheDocument();
    
    // Check that unit selects are present
    const unitSelects = screen.getAllByText('Yards');
    expect(unitSelects.length).toBe(2);
  });

  test('calls onModeChange when mode is changed', () => {
    render(<ModePanel {...defaultProps} />);
    
    // Click on Range Card radio button
    const rangeCardRadio = screen.getByLabelText('Range Card');
    fireEvent.click(rangeCardRadio);
    
    // Check that onModeChange was called with the correct value
    expect(defaultProps.onModeChange).toHaveBeenCalledWith('RANGE_CARD');
  });

  test('calls onRangeCardStartChange when start value is changed', () => {
    render(<ModePanel {...defaultProps} mode="RANGE_CARD" />);
    
    // Find the start input field and change its value
    const startInput = screen.getByDisplayValue('100');
    fireEvent.change(startInput, { target: { value: '200' } });
    
    // Check that onRangeCardStartChange was called with the correct value
    expect(defaultProps.onRangeCardStartChange).toHaveBeenCalledWith('200');
  });

  test('calls onRangeCardStepChange when step value is changed', () => {
    render(<ModePanel {...defaultProps} mode="RANGE_CARD" />);
    
    // Find the step input field and change its value
    const stepInput = screen.getByDisplayValue('50');
    fireEvent.change(stepInput, { target: { value: '100' } });
    
    // Check that onRangeCardStepChange was called with the correct value
    expect(defaultProps.onRangeCardStepChange).toHaveBeenCalledWith('100');
  });

  test('calls onUnitChange when unit is changed', () => {
    render(<ModePanel {...defaultProps} mode="RANGE_CARD" />);
    
    // Find the unit select and change its value
    const unitSelects = screen.getAllByText('Yards');
    fireEvent.mouseDown(unitSelects[0]);
    
    // Select Meters option
    const metersOption = screen.getByText('Meters');
    fireEvent.click(metersOption);
    
    // Check that onUnitChange was called with the correct value
    expect(defaultProps.onUnitChange).toHaveBeenCalledWith('METERS');
  });
});
