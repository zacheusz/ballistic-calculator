import React from 'react';
import { 
  FormControl, 
  FormLabel, 
  Select, 
  MenuItem, 
  FormHelperText,
  Box,
  SelectChangeEvent
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAppConfigStore, Theme } from '../stores/useAppConfigStore';

/**
 * A reusable component for selecting the application theme
 * Uses the Zustand store exclusively to manage theme state
 * Material UI version
 */
const ThemeSelectorMUI: React.FC = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useAppConfigStore();

  const handleChange = (e: SelectChangeEvent<string>) => {
    const newTheme = e.target.value as Theme;
    setTheme(newTheme);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth size="small">
        <FormLabel id="theme-selector-label" sx={{ mb: 1 }}>
          {t('theme')}
        </FormLabel>
        <Select
          labelId="theme-selector-label"
          value={theme}
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="light">{t('light')}</MenuItem>
          <MenuItem value="dark">{t('dark')}</MenuItem>
        </Select>
        <FormHelperText>
          {/* Optionally provide a translated helper text if needed */}
        </FormHelperText>
      </FormControl>
    </Box>
  );
};

export default ThemeSelectorMUI;
