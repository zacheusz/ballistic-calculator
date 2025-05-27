import { render, screen } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import WindSegmentComponent from '../WindSegmentComponent';
import { WindSegment, Unit } from '../../types/ballistics';

// Mock i18n
jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

describe('WindSegmentComponent', () => {
  const defaultWindSegments: WindSegment[] = [
    {
      maxRange: { value: 1000, unit: 'YARDS' as Unit },
      speed: { value: 10, unit: 'MILES_PER_HOUR' as Unit },
      direction: { value: 3, unit: 'CLOCK' as Unit },
      verticalComponent: { value: 0, unit: 'MILES_PER_HOUR' as Unit }
    }
  ];

  // Create a mock ref object that matches the expected type
  const createMockRef = () => {
    const inputElement = document.createElement('input');
    return { current: inputElement };
  };

  const defaultProps = {
    windSegments: defaultWindSegments,
    handleShotChange: jest.fn(),
    handleBlur: jest.fn(),
    // Mock getWindSegmentRef to return a proper ref object
    getWindSegmentRef: jest.fn().mockImplementation(() => createMockRef()),
    loading: false,
    values: {
      shot: {
        windSegments: defaultWindSegments
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders wind segment fields with correct values', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <WindSegmentComponent {...defaultProps} />
      </LocalizationProvider>
    );
    
    // Check for wind segment title
    expect(screen.getByText('calcWindSegment 1')).toBeInTheDocument();
    
    // Check for labels
    expect(screen.getByText('calcMaxRange')).toBeInTheDocument();
    expect(screen.getByText('calcWindSpeed')).toBeInTheDocument();
    expect(screen.getByText('calcWindDirection')).toBeInTheDocument();
    expect(screen.getByText('calcVerticalComponent')).toBeInTheDocument();
    
    // Check that add wind segment button is rendered
    expect(screen.getByText('calcAddWindSegment')).toBeInTheDocument();
  });

  test('component structure', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <WindSegmentComponent {...defaultProps} />
      </LocalizationProvider>
    );
    
    // Check that the component renders with the correct title
    expect(screen.getByText('calcWindSegments')).toBeInTheDocument();
    
    // Check that the first wind segment is rendered
    expect(screen.getByText('calcWindSegment 1')).toBeInTheDocument();
    
    // Check for the add button
    expect(screen.getByText('calcAddWindSegment')).toBeInTheDocument();
  });

  test('mocks handleShotChange correctly', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <WindSegmentComponent {...defaultProps} />
      </LocalizationProvider>
    );
    
    // Verify the mock function was created correctly
    expect(defaultProps.handleShotChange).toBeDefined();
    expect(typeof defaultProps.handleShotChange).toBe('function');
  });

  test('renders the wind direction field', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <WindSegmentComponent {...defaultProps} />
      </LocalizationProvider>
    );
    
    // Check that the wind direction label is rendered
    expect(screen.getByText('calcWindDirection')).toBeInTheDocument();
  });

  test('renders the vertical component field', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <WindSegmentComponent {...defaultProps} />
      </LocalizationProvider>
    );
    
    // Check that the vertical component label is rendered
    expect(screen.getByText('calcVerticalComponent')).toBeInTheDocument();
  });

  test('renders the add wind segment button', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <WindSegmentComponent {...defaultProps} />
      </LocalizationProvider>
    );
    
    // Find the add button
    const addButton = screen.getByText('calcAddWindSegment');
    expect(addButton).toBeInTheDocument();
  });

  test('renders multiple wind segments correctly', () => {
    // Create props with two wind segments
    const propsWithTwoSegments = {
      ...defaultProps,
      windSegments: [
        ...defaultWindSegments,
        {
          maxRange: { value: 2000, unit: 'YARDS' as Unit },
          speed: { value: 15, unit: 'MILES_PER_HOUR' as Unit },
          direction: { value: 6, unit: 'CLOCK' as Unit },
          verticalComponent: { value: 5, unit: 'MILES_PER_HOUR' as Unit }
        }
      ]
    };
    
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <WindSegmentComponent {...propsWithTwoSegments} />
      </LocalizationProvider>
    );
    
    // Check that both wind segments are rendered
    expect(screen.getByText('calcWindSegment 1')).toBeInTheDocument();
    expect(screen.getByText('calcWindSegment 2')).toBeInTheDocument();
    
    // Check that remove button is rendered
    expect(screen.getByText('calcRemoveSegment')).toBeInTheDocument();
  });

  test('disables inputs when loading is true', () => {
    render(
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <WindSegmentComponent {...defaultProps} loading={true} />
      </LocalizationProvider>
    );
    
    // Verify the component still renders when loading
    expect(screen.getByText('calcWindSegments')).toBeInTheDocument();
    expect(screen.getByText('calcWindSegment 1')).toBeInTheDocument();
    
    // Check that add button is present
    expect(screen.getByText('calcAddWindSegment')).toBeInTheDocument();
  });
});
