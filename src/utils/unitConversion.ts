import { Unit } from '../types/ballistics';

// Conversion factors for different units
export const CONVERSION_FACTORS = {
  // Length
  INCHES: 1,
  FEET: 12,
  YARDS: 36,
  CENTIMETERS: 0.393701,
  METERS: 39.3701,
  MILLIMETERS: 0.0393701,
  
  // Weight
  GRAINS: 1,
  GRAMS: 15.4324,
  OUNCES: 437.5,
  POUNDS: 7000,
  KILOGRAMS: 15432.4,
  
  // Velocity
  FPS: 1,
  MPH: 1.46667,
  KPH: 0.911344,
  MPS: 3.28084,
  
  // Pressure
  IN_HG: 1,
  MM_HG: 0.0393701,
  MBAR: 0.02953,
  HPA: 0.02953,
  PSI: 2.03602,
  KPA: 0.2953,
  
  // Temperature
  FAHRENHEIT: 1,
  CELSIUS: 1.8,
  KELVIN: 1.8,
  
  // Angular
  DEGREES: 1,
  MILS: 0.05625,
  RADIANS: 57.2958,
} as const;

/**
 * Convert a value from one unit to another
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
  
  // For other units, use conversion factors
  const fromFactor = CONVERSION_FACTORS[fromUnit as keyof typeof CONVERSION_FACTORS] || 1;
  const toFactor = CONVERSION_FACTORS[toUnit as keyof typeof CONVERSION_FACTORS] || 1;
  
  return (value * fromFactor) / toFactor;
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
export const formatNumber = (value: number, decimals = 2): string => {
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
