import React from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  Box
} from '@mui/material';
// @ts-ignore - Using declaration files for these components
import ThemeSelector from '../../components/ThemeSelector';
// @ts-ignore - Using declaration files for these components
import LanguageSelector from '../../components/LanguageSelector';
import { Theme } from '../../stores/useAppConfigStore';

interface DisplayOptionsTabProps {
  theme?: Theme;
  language?: string;
  onThemeChange?: (theme: Theme) => void;
  onLanguageChange?: (language: string) => void;
  t: (key: string) => string; // Translation function
}

const DisplayOptionsTab: React.FC<DisplayOptionsTabProps> = ({
  theme,
  language,
  onThemeChange,
  onLanguageChange,
  t
}) => {
  return (
    <form>
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title={t('displayOptions')} 
          action={<LanguageSelector currentLanguage={language} onChange={onLanguageChange} />}
        />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <ThemeSelector currentTheme={theme} onChange={onThemeChange} />
          </Box>
        </CardContent>
      </Card>
    </form>
  );
};

export default DisplayOptionsTab;
