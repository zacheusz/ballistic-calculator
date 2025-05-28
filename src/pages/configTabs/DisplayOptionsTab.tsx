import React from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  Box
} from '@mui/material';
import ThemeSelectorMUI from '../../components/ThemeSelectorMUI';
import LanguageSelectorMUI from '../../components/LanguageSelectorMUI';
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
          action={<LanguageSelectorMUI />}
        />
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <ThemeSelectorMUI />
          </Box>
        </CardContent>
      </Card>
    </form>
  );
};

export default DisplayOptionsTab;
