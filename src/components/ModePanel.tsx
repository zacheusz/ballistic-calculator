import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  TextField,
  Select,
  MenuItem,
  Box,
  SelectChangeEvent,
  Stack,
  Typography
} from '@mui/material';
import { Unit } from '../types/ballistics';

interface ModePanelProps {
  mode: 'HUD' | 'RANGE_CARD';
  onModeChange: (mode: string) => void;
  rangeCardStart: number;
  onRangeCardStartChange: (value: string) => void;
  rangeCardStep: number;
  onRangeCardStepChange: (value: string) => void;
  unit: Unit;
  onUnitChange: (unit: string) => void;
}

const ModePanel: React.FC<ModePanelProps> = ({
  mode, 
  onModeChange, 
  rangeCardStart, 
  onRangeCardStartChange, 
  rangeCardStep, 
  onRangeCardStepChange, 
  unit, 
  onUnitChange 
}) => {
  const { t } = useTranslation();
  return (
    <Card sx={{ mb: 4, width: '100%' }}>
      <CardHeader title={t('calcMode')} />
      <CardContent>
        <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Typography sx={{ width: '33%', fontWeight: 500 }}>{t('calcDisplayMode')}</Typography>
            <RadioGroup
              row
              name="displayMode"
              value={mode}
              onChange={(e) => onModeChange(e.target.value)}
            >
              <FormControlLabel
                value="HUD"
                control={<Radio />}
                label={t('calcHudMode')}
                id="hud-mode"
              />
              <FormControlLabel
                value="RANGE_CARD"
                control={<Radio />}
                label={t('calcRangeCardMode')}
                id="range-card-mode"
              />
            </RadioGroup>
          </Stack>
        </FormControl>

        {mode === 'RANGE_CARD' && (
          <>
            <FormControl sx={{ mb: 3, width: '100%' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Typography sx={{ width: { xs: '100%', sm: '33%' }, fontWeight: 500 }}>{t('calcRangeCardStart')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '67%' } }}>
                  <TextField
                    type="number"
                    value={rangeCardStart || ''}
                    onChange={(e) => onRangeCardStartChange(e.target.value)}
                    inputProps={{ min: 0 }}
                    size="small"
                    sx={{ mr: 2, minWidth: 120, flexGrow: 1 }}
                  />
                  <Select
                    value={unit}
                    onChange={(e: SelectChangeEvent<string>) => onUnitChange(e.target.value as string)}
                    size="small"
                    sx={{ width: 'auto' }}
                  >
                    <MenuItem value="YARDS">{t('yards')}</MenuItem>
                    <MenuItem value="METERS">{t('meters')}</MenuItem>
                  </Select>
                </Box>
              </Stack>
            </FormControl>
            <FormControl sx={{ mb: 3, width: '100%' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                <Typography sx={{ width: { xs: '100%', sm: '33%' }, fontWeight: 500 }}>{t('calcRangeCardStep')}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: '67%' } }}>
                  <TextField
                    type="number"
                    value={rangeCardStep || ''}
                    onChange={(e) => onRangeCardStepChange(e.target.value)}
                    inputProps={{ min: 1 }}
                    size="small"
                    sx={{ mr: 2, minWidth: 120, flexGrow: 1 }}
                  />
                  <Select
                    value={unit}
                    onChange={(e: SelectChangeEvent<string>) => onUnitChange(e.target.value as string)}
                    size="small"
                    sx={{ width: 'auto' }}
                  >
                    <MenuItem value="YARDS">{t('yards')}</MenuItem>
                    <MenuItem value="METERS">{t('meters')}</MenuItem>
                  </Select>
                </Box>
              </Stack>
            </FormControl>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ModePanel;
