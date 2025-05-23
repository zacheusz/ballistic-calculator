import React, { useMemo } from 'react';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useTheme } from '../context/ThemeContext';

/**
 * Component for displaying ballistics calculation results using MUI X Data Grid
 * Provides sorting, filtering, and export capabilities
 */
const BallisticsResultsGrid = ({ results, unitPreferences }) => {
  const { theme } = useTheme();

  // Define columns based on the available data
  const columns = useMemo(() => {
    if (!results || !results.length) return [];

    return [
      { field: 'range', headerName: `Range (${getUnitLabel(unitPreferences.Range)})`, width: 120, type: 'number' },
      { field: 'verticalAdjustment', headerName: `Elevation (${getUnitLabel(unitPreferences.ScopeAdjustment)})`, width: 120, type: 'number' },
      { field: 'horizontalAdjustment', headerName: `Windage Adj (${getUnitLabel(unitPreferences.ScopeAdjustment)})`, width: 120, type: 'number' },
      { field: 'drop', headerName: `Drop (${getUnitLabel(unitPreferences.ScopeAdjustment)})`, width: 120, type: 'number' },
      { field: 'wind', headerName: `Wind Drift (${getUnitLabel(unitPreferences.ScopeAdjustment)})`, width: 120, type: 'number' },
      { field: 'velocity', headerName: `Velocity (${getUnitLabel(unitPreferences.BulletVelocity)})`, width: 120, type: 'number' },
      { field: 'energy', headerName: `Energy (${getUnitLabel(unitPreferences.BulletEnergy)})`, width: 120, type: 'number' },
      { field: 'time', headerName: `Time (${getUnitLabel(unitPreferences.TimeOfFlight)})`, width: 100, type: 'number' },
      { field: 'mach', headerName: 'Mach', width: 100, type: 'number' },
      { field: 'spinDrift', headerName: `Spin Drift (${getUnitLabel(unitPreferences.ScopeAdjustment)})`, width: 120, type: 'number' },
      { field: 'coroDrift', headerName: `Coriolis (${getUnitLabel(unitPreferences.ScopeAdjustment)})`, width: 120, type: 'number' },
      { field: 'lead', headerName: `Lead (${getUnitLabel(unitPreferences.ScopeAdjustment)})`, width: 100, type: 'number' },
      { field: 'aeroJump', headerName: `Aero Jump (${getUnitLabel(unitPreferences.ScopeAdjustment)})`, width: 120, type: 'number' },
    ];
  }, [results, unitPreferences]);

  // Transform results into rows with IDs
  const rows = useMemo(() => {
    if (!results || !results.length) return [];
    
    return results.map((result, index) => ({
      id: index,
      range: formatNumber(result.range),
      verticalAdjustment: formatNumber(result.verticalAdjustment),
      horizontalAdjustment: formatNumber(result.horizontalAdjustment),
      drop: formatNumber(result.drop),
      wind: formatNumber(result.wind),
      velocity: formatNumber(result.velocity),
      energy: formatNumber(result.energy),
      time: formatNumber(result.time),
      mach: formatNumber(result.mach),
      spinDrift: formatNumber(result.spinDrift),
      coroDrift: formatNumber(result.coroDrift),
      lead: formatNumber(result.lead),
      aeroJump: formatNumber(result.aeroJump),
    }));
  }, [results]);

  // Helper function to format numbers with 2 decimal places
  function formatNumber(value) {
    if (value === undefined || value === null) return null;
    return Number(parseFloat(value).toFixed(2));
  }

  // Helper function to get readable unit labels
  function getUnitLabel(unit) {
    const unitMap = {
      'YARDS': 'yd',
      'METERS': 'm',
      'FEET': 'ft',
      'MOA': 'MOA',
      'MILS': 'MRAD',
      'INCHES': 'in',
      'CENTIMETERS': 'cm',
      'FEET_PER_SECOND': 'ft/s',
      'METERS_PER_SECOND': 'm/s',
      'MILES_PER_HOUR': 'mph',
      'KILOMETERS_PER_HOUR': 'km/h',
      'FOOT_POUNDS': 'ft-lb',
      'JOULES': 'J',
      'SECONDS': 's',
    };
    
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
