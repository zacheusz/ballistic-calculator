import React, { useMemo, useCallback } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import { Solution } from '../types/apiTypes';

// Using the Solution interface from apiTypes.ts with optional properties and index signature
type BallisticSolution = Partial<Solution> & { [key: string]: any };

interface BallisticsResultsGridProps {
  results: BallisticSolution[];
  unitPreferences?: Record<string, string>;
}

/**
 * Component for displaying ballistics calculation results using MUI X Data Grid
 * Provides sorting, filtering, and export capabilities
 */
const BallisticsResultsGrid: React.FC<BallisticsResultsGridProps> = ({ results, unitPreferences = {} }) => {
  const { theme } = useAppConfigStore();

  // Helper to extract unit from object fields, fallback to unitPreferences
  const extractUnitOrPref = useCallback((field: any, prefKey?: string): string => {
    if (field && typeof field === 'object' && 'unit' in field && field.unit) return getUnitLabel(field.unit);
    if (unitPreferences && prefKey && unitPreferences[prefKey]) return getUnitLabel(unitPreferences[prefKey]);
    return '';
  }, [unitPreferences]);

  // Define columns based on the available data and actual units from the first row, fallback to preferences
  const columns = useMemo(() => {
    const first = (results && results.length > 0) ? results[0] : {};
    function headerWithUnit(label: string, field: any, prefKey: string): string {
      const unit = extractUnitOrPref(field, prefKey);
      return unit ? `${label} (${unit})` : label;
    }
    return [
      { field: 'range', headerName: headerWithUnit('Range', first.range, 'Range'), width: 120, type: 'number' as const },
      { field: 'horizontalAdjustment', headerName: headerWithUnit('Windage Adj', first.horizontalAdjustment, 'ScopeAdjustment'), width: 120, type: 'number' as const },
      { field: 'verticalAdjustment', headerName: headerWithUnit('Elevation', first.verticalAdjustment, 'ScopeAdjustment'), width: 120, type: 'number' as const },
      { field: 'time', headerName: headerWithUnit('Time', undefined, 'TimeOfFlight'), width: 100, type: 'number' as const },
      { field: 'energy', headerName: headerWithUnit('Energy', first.energy, 'BulletEnergy'), width: 120, type: 'number' as const },
      { field: 'velocity', headerName: headerWithUnit('Velocity', first.velocity, 'BulletVelocity'), width: 120, type: 'number' as const },
      { field: 'mach', headerName: 'Mach', width: 100, type: 'number' as const },
      { field: 'drop', headerName: headerWithUnit('Drop', first.drop, 'ScopeAdjustment'), width: 120, type: 'number' as const },
      { field: 'coroDrift', headerName: headerWithUnit('Coriolis', first.coroDrift, 'ScopeAdjustment'), width: 120, type: 'number' as const },
      { field: 'lead', headerName: headerWithUnit('Lead', first.lead, 'ScopeAdjustment'), width: 100, type: 'number' as const },
      { field: 'spinDrift', headerName: headerWithUnit('Spin Drift', first.spinDrift, 'ScopeAdjustment'), width: 120, type: 'number' as const },
      { field: 'wind', headerName: headerWithUnit('Wind Drift', first.wind, 'ScopeAdjustment'), width: 120, type: 'number' as const },
      { field: 'aeroJump', headerName: headerWithUnit('Aero Jump', first.aeroJump, 'ScopeAdjustment'), width: 120, type: 'number' as const },
    ];
  }, [results, extractUnitOrPref]);

  // Helper to extract .value from object fields or return primitive if number
  const extractValue = (field: any): number | undefined => {
    if (field && typeof field === 'object' && 'value' in field) return field.value;
    return field;
  };

  // Transform results into rows with IDs, extracting .value from object fields
  const rows = useMemo(() => {
    if (!results || !results.length) return [];
    return results.map((result, index) => ({
      id: index,
      range: formatNumber(extractValue(result.range)),
      horizontalAdjustment: formatNumber(extractValue(result.horizontalAdjustment)),
      verticalAdjustment: formatNumber(extractValue(result.verticalAdjustment)),
      time: formatNumber(result.time),
      energy: formatNumber(extractValue(result.energy)),
      velocity: formatNumber(extractValue(result.velocity)),
      mach: formatNumber(result.mach),
      drop: formatNumber(extractValue(result.drop)),
      coroDrift: formatNumber(extractValue(result.coroDrift)),
      lead: formatNumber(extractValue(result.lead)),
      spinDrift: formatNumber(extractValue(result.spinDrift)),
      wind: formatNumber(extractValue(result.wind)),
      aeroJump: formatNumber(extractValue(result.aeroJump)),
    }));
  }, [results]);

  // Helper function to format numbers with 2 decimal places
  function formatNumber(value: number | undefined): number | null {
    if (value === undefined || value === null) return null;
    return Number(value.toFixed(2));
  }

  // Helper function to get readable unit labels
  function getUnitLabel(unit: string): string {
    const unitMap: { [key: string]: string } = {
      // RangeMeasurement
      'YARDS': 'yd',
      'METERS': 'm',
      'FEET': 'ft',
      // ScopeAdjustmentMeasurement
      'MILS': 'mrad',
      'MOA': 'MOA',
      'IPHY': 'IPHY',
      'DEGREES': '°',
      // GunParametersMeasurement
      'INCHES': 'in',
      'CENTIMETERS': 'cm',
      'MILLIMETERS': 'mm',
      // BulletVelocityMeasurement
      'FEET_PER_SECOND': 'ft/s',
      'METERS_PER_SECOND': 'm/s',
      // WindSpeedMeasurement, TargetSpeedMeasurement
      'MILES_PER_HOUR': 'mph',
      'KILOMETERS_PER_HOUR': 'km/h',
      // BulletEnergyMeasurement
      'FOOT_POUNDS': 'ft-lb',
      'JOULES': 'J',
      // BulletWeightMeasurement
      'GRAINS': 'gr',
      'GRAMS': 'g',
      // AtmosphericPressureMeasurement
      'INCHES_MERCURY': 'inHg',
      'HECTOPASCALS': 'hPa',
      // WindDirectionMeasurement
      'CLOCK': 'clock',
      // AngleMeasurement
      // Already mapped: 'DEGREES': '°',
      // TemperatureMeasurement
      'FAHRENHEIT': '°F',
      'CELSIUS': '°C',
      'RANKINE': '°R',
      // TimeOfFlightMeasurement
      'SECONDS': 's',
      'MILLISECONDS': 'ms',
    };
    // Fallback to showing the raw unit if not mapped and not empty
    if (!unit) return '';
    return unitMap[unit] || unit;
  }

  return (
    <div style={{ height: 500, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 10 },
          },
          sorting: {
            sortModel: [{ field: 'range', sort: 'asc' }],
          },
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 300 },
          },
        }}
        disableRowSelectionOnClick
        density="compact"
        sx={{
          '& .MuiDataGrid-cell': {
            fontSize: '0.9rem',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: '8px',
          },
          // Ensure proper theming
          color: theme === 'dark' ? '#fff' : 'inherit',
          '& .MuiDataGrid-main': {
            color: theme === 'dark' ? '#fff' : 'inherit',
          },
        }}
      />
    </div>
  );
};

export default BallisticsResultsGrid;
