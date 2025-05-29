import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Container, 
  Typography, 
  Box, 
  IconButton, 
  Button, 
  Chip,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';
// Using a simple SVG icon instead of MenuIcon to avoid dependency issues
const MenuIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import { useTranslation } from 'react-i18next';

// Styled NavLink for consistent styling
const StyledNavLink = ({ to, children, end = false }: { to: string; children: React.ReactNode; end?: boolean }) => {
  const location = useLocation();
  const theme = useTheme();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
  
  return (
    <Button
      component={NavLink as any}
      to={to}
      end={end || undefined}
      sx={{
        color: 'white',
        mx: 1,
        '&.active': {
          borderBottom: `2px solid ${theme.palette.primary.light}`,
          fontWeight: 'bold'
        },
        textTransform: 'none',
        ...(isActive && {
          borderBottom: `2px solid ${theme.palette.primary.light}`,
          fontWeight: 'bold'
        })
      }}
    >
      {children}
    </Button>
  );
};

const Navigation = () => {
  // Get API key from AppConfigStore to determine if configured
  const { apiKey, apiStage } = useAppConfigStore();
  const isConfigured = Boolean(apiKey);
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // For UI compatibility
  const environment = apiStage;
  
  // Mobile drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };
  
  // Environment badge color
  const getBadgeColor = () => {
    if (environment === 'prod') return 'error';
    if (environment === 'stage') return 'warning';
    return 'info';
  };
  
  // Mobile navigation drawer content
  const mobileDrawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem>
          <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: 'none', color: 'inherit' }}>
            {t('brandTitle')}
          </Typography>
        </ListItem>
        <Divider />
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/" end>
            <ListItemText primary={t('navHome')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/calculator">
            <ListItemText primary={t('navCalculator')} />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton component={NavLink} to="/config">
            <ListItemText primary={t('navConfig')} />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        {environment && (
          <ListItem>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                {t('navEnvironment')}:
              </Typography>
              <Chip 
                label={environment} 
                color={getBadgeColor()} 
                size="small" 
                variant="outlined"
              />
            </Box>
          </ListItem>
        )}
        {isConfigured && (
          <ListItem>
            <Typography variant="body2" color="success.main">
              {t('navApiKeyConfigured')}
            </Typography>
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          {/* Mobile view */}
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{ 
                  flexGrow: 1, 
                  textDecoration: 'none', 
                  color: 'inherit' 
                }}
              >
                {t('brandTitle')}
              </Typography>
              <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                {mobileDrawer}
              </Drawer>
            </>
          ) : (
            /* Desktop view */
            <>
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{ 
                  mr: 4, 
                  textDecoration: 'none', 
                  color: 'inherit',
                  fontWeight: 'bold'
                }}
              >
                {t('brandTitle')}
              </Typography>
              <Box sx={{ flexGrow: 1, display: 'flex' }}>
                <StyledNavLink to="/" end>{t('navHome')}</StyledNavLink>
                <StyledNavLink to="/calculator">{t('navCalculator')}</StyledNavLink>
                <StyledNavLink to="/config">{t('navConfig')}</StyledNavLink>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {environment && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 3 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {t('navEnvironment')}:
                    </Typography>
                    <Chip 
                      label={environment} 
                      color={getBadgeColor()} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </Box>
                )}
                {isConfigured && (
                  <Typography variant="body2" color="success.main">
                    {t('navApiKeyConfigured')}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation;
