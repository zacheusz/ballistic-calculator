import React from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  Box
} from '@mui/material';
import ThemeSelector from '../../components/ThemeSelector';
import LanguageSelector from '../../components/LanguageSelector';
import { TFunction } from 'i18next';

interface DisplayOptionsTabProps {
  t: TFunction<"translation", undefined> | ((key: string) => string);
}

const DisplayOptionsTab: React.FC<DisplayOptionsTabProps> = ({
  t
}) => {
  return (
    <form>
      <Card sx={{ mb: 4 }}>
        <CardHeader 
          title={t('displayOptions')} 
          action={<LanguageSelector />}
        />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <ThemeSelector />
          </Box>
        </CardContent>
      </Card>
    </form>
  );
};

export default DisplayOptionsTab;
