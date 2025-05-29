import React from 'react';
import { 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Card,
  CardHeader,
  CardContent,
  SelectChangeEvent,
  Typography,
  Paper,
  Stack,
  useTheme,
  Box
} from '@mui/material';
import { Unit } from '../../types/ballistics';

interface UnitPreferencesTabProps {
  preferences: {
    [key: string]: Unit;
  };
  onUnitChange: (unitType: string, value: Unit) => void;
  t: (key: string) => string; // Translation function
}

const UnitPreferencesTab: React.FC<UnitPreferencesTabProps> = ({
  preferences,
  onUnitChange
}) => {
  const theme = useTheme();
  
  const handleUnitChange = (unitType: string) => (event: SelectChangeEvent) => {
    onUnitChange(unitType, event.target.value as Unit);
  };

  // Group related unit preferences for better organization
  const unitGroups = [
    {
      title: 'Distance and Range',
      units: [
        { id: 'Range', label: 'Range', options: [
          { value: 'YARDS', label: 'Yards' },
          { value: 'METERS', label: 'Meters' },
          { value: 'FEET', label: 'Feet' }
        ]}
      ]
    },
    {
      title: 'Angle and Adjustment',
      units: [
        { id: 'ScopeAdjustment', label: 'Scope Adjustment', options: [
          { value: 'MILS', label: 'Mils' },
          { value: 'MOA', label: 'MOA' },
          { value: 'IPHY', label: 'IPHY' },
          { value: 'DEGREES', label: 'Degrees' }
        ]},
        { id: 'WindDirection', label: 'Wind Direction', options: [
          { value: 'CLOCK', label: 'Clock (1-12)' },
          { value: 'DEGREES', label: 'Degrees' }
        ]}
      ]
    },
    {
      title: 'Environmental Conditions',
      units: [
        { id: 'Temperature', label: 'Temperature', options: [
          { value: 'FAHRENHEIT', label: 'Fahrenheit' },
          { value: 'CELSIUS', label: 'Celsius' },
          { value: 'RANKINE', label: 'Rankine' }
        ]},
        { id: 'AtmosphericPressure', label: 'Atmospheric Pressure', options: [
          { value: 'INCHES_MERCURY', label: 'Inches of Mercury' },
          { value: 'HECTOPASCALS', label: 'Hectopascals' }
        ]},
        { id: 'WindSpeed', label: 'Wind Speed', options: [
          { value: 'MILES_PER_HOUR', label: 'Miles per Hour' },
          { value: 'KILOMETERS_PER_HOUR', label: 'Kilometers per Hour' },
          { value: 'METERS_PER_SECOND', label: 'Meters per Second' }
        ]}
      ]
    },
    {
      title: 'Bullet Properties',
      units: [
        { id: 'BulletVelocity', label: 'Bullet Velocity', options: [
          { value: 'FEET_PER_SECOND', label: 'Feet per Second' },
          { value: 'METERS_PER_SECOND', label: 'Meters per Second' }
        ]},
        { id: 'BulletWeight', label: 'Bullet Weight', options: [
          { value: 'GRAINS', label: 'Grains' },
          { value: 'GRAMS', label: 'Grams' }
        ]},
        { id: 'BulletEnergy', label: 'Bullet Energy', options: [
          { value: 'FOOT_POUNDS', label: 'Foot-Pounds' },
          { value: 'JOULES', label: 'Joules' }
        ]}
      ]
    },
    {
      title: 'Time Measurements',
      units: [
        { id: 'TimeOfFlight', label: 'Time of Flight', options: [
          { value: 'SECONDS', label: 'Seconds' },
          { value: 'MILLISECONDS', label: 'Milliseconds' }
        ]}
      ]
    }
  ];

  return (
    <form>
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title="Unit Preferences" 
          subheader="Select Preferred Units"
        />
        <CardContent>
          <Stack spacing={3}>
            {unitGroups.map((group, groupIndex) => (
              <Paper 
                key={groupIndex}
                elevation={0} 
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  borderColor: theme.palette.divider,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.02)'
                }}
              >
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    mb: 2
                  }}
                >
                  {group.title}
                </Typography>
                
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {group.units.map((unit, unitIndex) => (
                    <Box key={unitIndex} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel id={`${unit.id}-label`}>{unit.label}</InputLabel>
                        <Select
                          labelId={`${unit.id}-label`}
                          value={preferences[unit.id] || ''}
                          onChange={handleUnitChange(unit.id)}
                          label={unit.label}
                        >
                          {unit.options.map((option, optionIndex) => (
                            <MenuItem key={optionIndex} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </form>
  );
};

export default UnitPreferencesTab;
