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
import { useAppConfigStore } from '../stores/useAppConfigStore';

/**
 * LanguageSelector: allows user to switch between English and Polish
 * Material UI version
 */
const LanguageSelector: React.FC = () => {
  const { i18n, t } = useTranslation();
  const { language, setLanguage } = useAppConfigStore();
  const currentLang = language || i18n.language || 'en';

  const handleChange = (e: SelectChangeEvent<string>) => {
    const lang = e.target.value;
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  return (
    <Box sx={{ mb: 3, minWidth: 150 }}>
      <FormControl fullWidth size="small">
        <FormLabel id="language-selector-label" sx={{ mb: 1 }}>
          {t('language')}
        </FormLabel>
        <Select
          labelId="language-selector-label"
          value={currentLang}
          onChange={handleChange}
          displayEmpty
        >
          <MenuItem value="en">{t('english')}</MenuItem>
          <MenuItem value="pl">{t('polish')}</MenuItem>
        </Select>
        <FormHelperText>
          {t('selectLanguage')}
        </FormHelperText>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;
