import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardActions, 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab
} from '@mui/material';
import { useAppConfigStore } from '../stores/useAppConfigStore';
import { useBallistics } from '../hooks/useBallistics';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../i18n';

// Import tab components
import {
  ApiSettingsTab,
  UnitPreferencesTab,
  FirearmProfileTab,
  AmmunitionTab,
  CalculationOptionsTab,
  DisplayOptionsTab
} from './configTabs';

import { 
  Measurement, 
  FirearmProfile, 
  Ammo, 
  Unit, 
  UnitPreference
} from '../types/ballistics';

const ConfigPageMUI: React.FC = () => {
  const { t } = useTranslation();
  
  // Get app config state from store
  const { 
    apiKey, 
    setApiKey, 
    apiStage, 
    setApiStage,
    theme,
    setTheme,
    language,
    setLanguage
  } = useAppConfigStore();
  
  // Get ballistics state from store
  const ballistics = useBallistics();
  const { 
    firearmProfile,
    ammo,
    preferences,
    updateFirearmProfile,
    updateAmmo,
    updatePreferences
  } = ballistics;
  
  // Local state for each tab
  const [inputApiKey, setInputApiKey] = useState(apiKey || '');
  const [selectedEnvironment, setSelectedEnvironment] = useState(apiStage || 'prod');
  
  // Local state for unit preferences
  const [unitPrefs, setUnitPrefs] = useState<UnitPreference[]>(
    preferences?.unitPreferences?.unitMappings || []
  );
  
  // Create a mapping of unit types to unit values for the UnitPreferencesTab
  const unitPrefsMap = useMemo(() => {
    const map: {[key: string]: Unit} = {};
    unitPrefs.forEach(pref => {
      map[pref.unitTypeClassName] = pref.unitName;
    });
    return map;
  }, [unitPrefs]);
  
  // Local state for firearm profile
  const [localFirearm, setLocalFirearm] = useState<FirearmProfile>(firearmProfile || {} as FirearmProfile);
  
  // Local state for ammunition
  const [localAmmo, setLocalAmmo] = useState<Ammo>(ammo || {} as Ammo);
  
  // Local state for calculation options
  const [calcOptions, setCalcOptions] = useState({
    calculateSpinDrift: preferences?.calculateSpinDrift || false,
    calculateCoriolisEffect: preferences?.calculateCoriolisEffect || false,
    calculateAeroJump: preferences?.calculateAeroJump || false,
    rangeCardStart: preferences?.rangeCardStart || { value: 100, unit: 'YARDS' as Unit },
    rangeCardStep: preferences?.rangeCardStep || { value: 100, unit: 'YARDS' as Unit }
  });
  
  // Error state - we'll use this for API error handling
  const [error, setError] = useState<string>('');
  // Function to handle API errors
  const handleApiError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  // URL-based tab state management
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  // Set default tab if none is specified in URL
  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: 'api' });
    }
  }, [tabParam, setSearchParams]);
  
  // Active tab state - derived from URL parameter
  const activeTab = tabParam || 'api';
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSearchParams({ tab: newValue });
  };
  
  // API key update handler
  const handleApiKeyChange = useCallback((value: string) => {
    setInputApiKey(value);
    if (value.trim()) {
      setApiKey(value.trim());
    }
  }, [setApiKey]);
  
  // Environment change handler
  const handleEnvironmentChange = useCallback((value: string) => {
    setSelectedEnvironment(value);
    if (value === 'test' || value === 'dev' || value === 'stage' || value === 'prod') {
      setApiStage(value as 'test' | 'dev' | 'stage' | 'prod');
    }
  }, [setApiStage]);
  
  // Unit preference changes handler
  const handleUnitChange = useCallback((unitType: string, value: Unit) => {
    const updatedUnitMappings = [...unitPrefs];
    const existingIndex = updatedUnitMappings.findIndex(m => m.unitTypeClassName === unitType);
    
    if (existingIndex >= 0) {
      updatedUnitMappings[existingIndex] = { ...updatedUnitMappings[existingIndex], unitName: value };
    } else {
      updatedUnitMappings.push({ unitTypeClassName: unitType, unitName: value });
    }
    
    setUnitPrefs(updatedUnitMappings);
    
    // Update the preferences in the ballistics store
    updatePreferences({
      unitPreferences: {
        unitMappings: updatedUnitMappings
      }
    });
  }, [unitPrefs, updatePreferences]);
  
  // Firearm changes handler
  const handleFirearmChange = useCallback((field: string, value: any) => {
    const updatedFirearm = { ...localFirearm, [field]: value };
    setLocalFirearm(updatedFirearm);
    updateFirearmProfile({ firearmProfile: updatedFirearm });
  }, [localFirearm, updateFirearmProfile]);
  
  // Firearm measurement changes handler
  const handleFirearmMeasurementChange = useCallback((field: string, measurement: Measurement) => {
    const updatedFirearm = { ...localFirearm, [field]: measurement };
    setLocalFirearm(updatedFirearm);
    updateFirearmProfile({ firearmProfile: updatedFirearm });
  }, [localFirearm, updateFirearmProfile]);
  
  // Ammo changes handler
  const handleAmmoChange = useCallback((field: string, value: any) => {
    // Special case for nested fields like ballisticCoefficients.0.value
    if (field.includes('.')) {
      const [parentField, index, childField] = field.split('.');
      const updatedAmmo = { ...localAmmo };
      
      // Ensure the array exists
      if (!updatedAmmo[parentField as keyof Ammo]) {
        (updatedAmmo[parentField as keyof Ammo] as any) = [];
      }
      
      // Ensure the object at the specified index exists
      const arr = updatedAmmo[parentField as keyof Ammo] as any[];
      if (!arr[parseInt(index)]) {
        arr[parseInt(index)] = {};
      }
      
      // Update the value
      arr[parseInt(index)][childField] = value;
      
      setLocalAmmo(updatedAmmo);
      updateAmmo({ ammo: updatedAmmo });
    } else {
      // Regular field update
      const updatedAmmo = { ...localAmmo, [field]: value };
      setLocalAmmo(updatedAmmo);
      updateAmmo({ ammo: updatedAmmo });
    }
  }, [localAmmo, updateAmmo]);
  
  // Ammo measurement changes handler
  const handleAmmoMeasurementChange = useCallback((field: string, measurement: Measurement) => {
    const updatedAmmo = { ...localAmmo, [field]: measurement };
    setLocalAmmo(updatedAmmo);
    updateAmmo({ ammo: updatedAmmo });
  }, [localAmmo, updateAmmo]);
  
  // Calculation options changes handler
  const handleCalcOptionsChange = useCallback((field: string, value: any) => {
    const updatedOptions = { ...calcOptions, [field]: value };
    setCalcOptions(updatedOptions);
    
    // Update preferences in the ballistics store
    updatePreferences({
      [field]: value
    });
  }, [calcOptions, updatePreferences]);

  return (
    <Container sx={{ my: 4 }}>
      <Card>
        <CardHeader title={t('settings')} />
        <CardContent>
          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="settings tabs"
              >
                <Tab label={t('apiSettings')} value="api" />
                <Tab label={t('unitPreferences')} value="units" />
                <Tab label={t('firearmProfile')} value="firearm" />
                <Tab label={t('ammunition')} value="ammo" />
                <Tab label={t('calculationOptions')} value="calc" />
                <Tab label={t('displayOptions')} value="display" />
              </Tabs>
            </Box>
            
            {/* API Settings Tab */}
            {activeTab === "api" && (
              <ApiSettingsTab
                apiKey={inputApiKey}
                environment={selectedEnvironment}
                error={error}
                onApiKeyChange={handleApiKeyChange}
                onEnvironmentChange={handleEnvironmentChange}
                t={t}
              />
            )}
            
            {/* Unit Preferences Tab */}
            {activeTab === "units" && (
              <UnitPreferencesTab
                preferences={unitPrefsMap}
                onUnitChange={handleUnitChange}
                t={t}
              />
            )}
            
            {/* Firearm Profile Tab */}
            {activeTab === "firearm" && (
              <FirearmProfileTab
                firearm={localFirearm}
                onFirearmChange={handleFirearmChange}
                onFirearmMeasurementChange={handleFirearmMeasurementChange}
                t={t}
              />
            )}
            
            {/* Ammunition Tab */}
            {activeTab === "ammo" && (
              <AmmunitionTab
                ammunition={localAmmo}
                onAmmoChange={handleAmmoChange}
                onAmmoMeasurementChange={handleAmmoMeasurementChange}
                t={t}
              />
            )}
            
            {/* Calculation Options Tab */}
            {activeTab === "calc" && (
              <CalculationOptionsTab
                options={calcOptions}
                onOptionsChange={handleCalcOptionsChange}
                t={t}
              />
            )}
            
            {/* Display Options Tab */}
            {activeTab === "display" && (
              <DisplayOptionsTab
                theme={theme}
                language={language}
                onThemeChange={setTheme}
                onLanguageChange={setLanguage}
                t={t}
              />
            )}
          </Box>
        </CardContent>
        <CardActions>
          <Typography variant="body2" color="text.secondary">
            {t('settingsAutoSaved')}
          </Typography>
        </CardActions>
      </Card>
    </Container>
  );
};

export default ConfigPageMUI;
