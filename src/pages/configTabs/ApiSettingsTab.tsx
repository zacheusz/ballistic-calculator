import React from 'react';
import { 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography, 
  Alert,
  SelectChangeEvent,
  Box
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
    <Box component="form" noValidate autoComplete="off">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{t(error)}</Alert>}
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* API Key Section */}
        <Box sx={{ flex: { md: '0 0 66.666%' }, width: '100%' }}>
          <TextField
            id="api-key"
            label={t('snipeBallisticsApiKey')}
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            required
            size="small"
            variant="outlined"
            margin="normal"
            fullWidth
          />
          <Box sx={{ px: 1, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {t('apiKeyCaption')}
            </Typography>
          </Box>
        </Box>
        
        {/* Environment Section */}
        <Box sx={{ flex: { md: '0 0 33.333%' }, width: '100%' }}>
          <FormControl fullWidth variant="outlined" margin="normal" size="small">
            <InputLabel id="environment-label">{t('environment')}</InputLabel>
            <Select
              labelId="environment-label"
              id="environment"
              value={environment}
              onChange={(e: SelectChangeEvent) => onEnvironmentChange(e.target.value)}
              label={t('environment')}
            >
              <MenuItem value="dev">{t('development')}</MenuItem>
              <MenuItem value="test">{t('test')}</MenuItem>
              <MenuItem value="stage">{t('staging')}</MenuItem>
              <MenuItem value="prod">{t('production')}</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ px: 1, mt: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {t('environmentCaption')}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ApiSettingsTab;
