import React from 'react';
import { 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Box,
  Link as MuiLink,
  Stack
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import { useTranslation } from 'react-i18next';

/**
 * HomePage component using Material UI
 * Displays the main landing page with options to configure and use the calculator
 */
const HomePage: React.FC = () => {
  // Get API key from AppConfigStore to determine if configured
  const { apiKey } = useAppConfigStore();
  const isConfigured = Boolean(apiKey);
  const { t } = useTranslation();

  return (
    <Container sx={{ my: 5 }}>
      {/* Header Section */}
      <Stack direction="column" alignItems="center" sx={{ mb: 5, textAlign: 'center' }}>
        <Box sx={{ width: { xs: '100%', md: '66.66%' } }}>
          <Typography variant="h2" component="h1" gutterBottom>
            {t('homeTitle')}
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            {t('homeSubtitle')}
          </Typography>
        </Box>
      </Stack>

      {/* Main Cards Section */}
      <Stack direction="row" spacing={4} justifyContent="center" flexWrap="wrap">
        {/* Configuration Card */}
        <Box sx={{ width: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                {t('homeConfigTitle')}
              </Typography>
              <Typography sx={{ mb: 3 }}>
                {t('homeConfigDesc')}
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Button 
                  component={Link} 
                  to="/config" 
                  variant="outlined" 
                  color="primary"
                >
                  {isConfigured ? t('homeUpdateConfig') : t('homeConfigureApp')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Calculator Card */}
        <Box sx={{ width: { xs: '100%', sm: '45%', md: '30%' }, mb: 2 }}>
          <Card 
            elevation={3} 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              }
            }}
          >
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Typography variant="h5" component="h3" gutterBottom>
                {t('homeCalcTitle')}
              </Typography>
              <Typography sx={{ mb: 3 }}>
                {t('homeCalcDesc')}
              </Typography>
              <Box sx={{ mt: 'auto' }}>
                <Button 
                  component={Link} 
                  to="/calculator" 
                  variant="contained" 
                  color="primary"
                >
                  {t('homeStartCalc')}
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {/* About Section */}
      <Stack direction="column" alignItems="center" sx={{ mt: 5 }}>
        <Box sx={{ width: { xs: '100%', md: '66.66%' } }}>
          <Card 
            variant="outlined" 
            sx={{ 
              boxShadow: 1,
              borderRadius: 2
            }}
          >
            <CardContent>
              <Typography variant="h6" component="h4" gutterBottom>
                {t('homeAboutTitle')}
              </Typography>
              <Typography paragraph>
                {t('homeAboutDesc')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('homeApiDoc')}: 
                <MuiLink 
                  href="https://api.calculator.snipe.technology/prod/docs/docs/openapi.yaml" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ ml: 1 }}
                >
                  {t('homeOpenApi')}
                </MuiLink>
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Stack>
    </Container>
  );
};

export default HomePage;
