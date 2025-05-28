import React from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid, 
  Typography, 
  Alert,
  SelectChangeEvent
} from '@mui/material';

interface ApiSettingsTabProps {
  apiKey: string;
  environment: string;
  error: string;
  onApiKeyChange: (value: string) => void;
  onEnvironmentChange: (value: string) => void;
  t: (key: string) => string; // Translation function
}

const ApiSettingsTab: React.FC<ApiSettingsTabProps> = ({
  apiKey,
  environment,
  error,
  onApiKeyChange,
  onEnvironmentChange,
  t
}) => {
  return (
    <form>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}</Alert>}
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <TextField
              id="api-key"
              fullWidth
              label={t('snipeBallisticsApiKey')}
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              required
              size="small"
              margin="dense"
            />
            <Typography variant="caption" color="text.secondary">
              {t('apiKeyRequired')} 
              {t('apiKeyStored')}
            </Typography>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="environment-label">{t('environment')}</InputLabel>
            <Select
              labelId="environment-label"
              value={environment}
              onChange={(e: SelectChangeEvent) => onEnvironmentChange(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="dev">{t('development')}</MenuItem>
              <MenuItem value="test">{t('test')}</MenuItem>
              <MenuItem value="stage">{t('staging')}</MenuItem>
              <MenuItem value="prod">{t('production')}</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary">
              {t('selectApiEnv')}
            </Typography>
          </FormControl>
        </Grid>
      </Grid>
    </form>
  );
};

export default ApiSettingsTab;
