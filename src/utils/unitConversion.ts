import { Unit } from '../types/ballistics';

/**
 * Unit conversion factors.
 * These factors convert from the specified unit to the internal base unit.
 * WARNING: These factors are not exact and are only used for display purposes.
 */
export const CONVERSION_FACTORS = {
  // Length units - Base unit: YARDS
  YARDS: 1.0,
  METERS: 1.093613298337708,
  FEET: 0.3333333333333333,
  INCHES: 0.027777777777778,
  CENTIMETERS: 0.010936132983377,
  MILLIMETERS: 0.001093613298338,
  
  // Weight/Mass units - Base unit: GRAINS
  GRAINS: 1.0,
  GRAMS: 15.4324,
  POUNDS: 7000.0,
  KILOGRAMS: 15432.4,
  
  // Velocity units - Base unit: FEET_PER_SECOND
  FEET_PER_SECOND: 1.0,
  METERS_PER_SECOND: 3.28084,
  MILES_PER_HOUR: 1.466666666667,
  KILOMETERS_PER_HOUR: 0.911344415281,
  
  // Pressure units - Base unit: INCHES_MERCURY
  INHG: 1.0,
  INCHES_MERCURY: 1.0,    // OpenAPI spec name for INHG
  MMHG: 0.03937008,       // 1 mmHg = 0.03937008 inHg
  HPASCAL: 0.0295333727,  // 1 hPa = 0.0295333727 inHg
  HECTOPASCALS: 0.0295333727, // OpenAPI spec name for HPASCAL
  MBAR: 0.0295333727,     // 1 mbar = 1 hPa = 0.0295333727 inHg
  
  // Energy units - Base unit: FOOT_POUNDS
  FOOT_POUNDS: 1.0,
  JOULES: 0.737562,
  
  // Angular units - Base unit: IPHY (Inches Per Hundred Yards)
  IPHY: 1.0,
  MOA: 1.047197551196598,
  MILS: 3.600000000000000,
  DEGREES: 62.831853071796,
  CLOCK: 1884.955592153876,
  
  // Time units - Base unit: SECONDS
  SECONDS: 1.0,
  MILLISECONDS: 0.001,
  MINUTES: 0.016666666667,
  HOURS: 0.000277777778
} as const;

/**
 * Convert a value from one unit to another using the internal unit system
 * 
 * @param value The value to convert
 * @param fromUnit The unit to convert from
 * @param toUnit The unit to convert to
 * @returns The converted value
 */
export const convertUnit = (
  value: number,
  fromUnit: string,
  toUnit: string
): number => {
  if (fromUnit === toUnit) return value;

  // Special case for temperature
  if (fromUnit === 'FAHRENHEIT' && toUnit === 'CELSIUS') {
    return (value - 32) * 5/9;
  }
  if (fromUnit === 'CELSIUS' && toUnit === 'FAHRENHEIT') {
    return (value * 9/5) + 32;
  }
  if (fromUnit === 'RANKINE' && toUnit === 'FAHRENHEIT') {
    return value - 459.67;
  }
  if (fromUnit === 'FAHRENHEIT' && toUnit === 'RANKINE') {
    return value + 459.67;
  }
  if (fromUnit === 'KELVIN' && toUnit === 'CELSIUS') {
    return value - 273.15;
  }
  if (fromUnit === 'CELSIUS' && toUnit === 'KELVIN') {
    return value + 273.15;
  }
  if (fromUnit === 'FAHRENHEIT' && toUnit === 'KELVIN') {
    return (value - 32) * 5/9 + 273.15;
  }
  if (fromUnit === 'KELVIN' && toUnit === 'FAHRENHEIT') {
    return (value - 273.15) * 9/5 + 32;
  }

  // Special case: CLOCK <-> IPHY (via degrees)
  // 1 o'clock = 30°, 2 o'clock = 60°, ..., 12 o'clock = 0° (or 360°)
  // IPHY <-> DEGREES handled by factors; CLOCK <-> DEGREES by mapping
  if ((fromUnit === 'CLOCK' && toUnit === 'IPHY') || (fromUnit === 'IPHY' && toUnit === 'CLOCK')) {
    // CLOCK to IPHY (support decimal clock values)
    if (fromUnit === 'CLOCK' && toUnit === 'IPHY') {
      // Convert decimal clock value to degrees
      let degrees = (value % 12) * 30;
      if (degrees === 0) degrees = 360; // 12 o'clock is 360°
      // Convert degrees to IPHY
      const degToIphy = convertUnit(degrees, 'DEGREES', 'IPHY');
      return degToIphy;
    }
    // IPHY to CLOCK (support decimals)
    if (fromUnit === 'IPHY' && toUnit === 'CLOCK') {
      // Convert IPHY to degrees
      const degrees = convertUnit(value, 'IPHY', 'DEGREES');
      // Map degrees to decimal clock value (1-12)
      let clock = (degrees / 30);
      if (clock <= 0) clock = 12;
      // Clamp to [1,12]
      if (clock > 12) clock = clock % 12;
      if (clock === 0) clock = 12;
      return clock;
    }
  }

  // For other units, convert to internal units and then to target units
  const fromFactor = CONVERSION_FACTORS[fromUnit as keyof typeof CONVERSION_FACTORS];
  const toFactor = CONVERSION_FACTORS[toUnit as keyof typeof CONVERSION_FACTORS];

  if (!fromFactor || !toFactor) {
    console.warn(`Conversion factor not found for ${fromUnit} or ${toUnit}`);
    return value; // Return original value if conversion factors are missing
  }

  // Convert to internal units, then to target units
  const internalValue = value * fromFactor;
  return internalValue / toFactor;
};

/**
 * Convert a measurement object to a different unit
 * @param measurement The measurement object to convert
 * @param toUnit The target unit
 * @returns A new measurement object with the converted value and unit
 */
export const convertMeasurement = <T extends { value: number; unit: string }>(
  measurement: T,
  toUnit: string
): T => {
  if (!measurement) return measurement;
  
  return {
    ...measurement,
    value: convertUnit(measurement.value, measurement.unit, toUnit),
    unit: toUnit,
  };
};

/**
 * Format a numeric value with the specified number of decimal places
 * @param value The value to format
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string
 */
export const formatNumber = (value: number, decimals = 4): string => {
  return Number(value.toFixed(decimals)).toString();
};

/**
 * Format a measurement with unit
 * @param value The numeric value
 * @param unit The unit of measurement
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export const formatMeasurement = (
  value: number,
  unit: string,
  decimals = 2
): string => {
  return `${formatNumber(value, decimals)} ${unit}`;
};

/**
 * Format a measurement object
 * @param measurement The measurement object with value and unit
 * @param decimals Number of decimal places (default: 2)
 * @returns Formatted string with unit
 */
export const formatMeasurementObject = (
  measurement: { value: number; unit: string },
  decimals = 2
): string => {
  if (!measurement) return '';
  return formatMeasurement(measurement.value, measurement.unit, decimals);
};
