import React from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  Box
} from '@mui/material';
import ThemeSelectorMUI from '../../components/ThemeSelectorMUI';
import LanguageSelectorMUI from '../../components/LanguageSelectorMUI';

interface DisplayOptionsTabProps {
  t: (key: string) => string; // Translation function
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
