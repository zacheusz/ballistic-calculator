import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  Container, 
  Typography, 
  Box, 
  Tabs, 
  Tab
} from '@mui/material';
import { useAppConfigStore, ApiStage } from '../stores/useAppConfigStore';
import { useBallistics } from '../hooks/useBallistics';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../i18n/i18nInit.ts';

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

const ConfigPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Get app config state from store
  const { 
    apiKey, 
    setApiKey, 
    apiStage, 
    setApiStage
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
  const [selectedEnvironment, setSelectedEnvironment] = useState<ApiStage>(apiStage || 'prod');
  
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
    calculateSpinDrift: preferences?.calculateSpinDrift ?? false,
    calculateCoriolisEffect: preferences?.calculateCoriolisEffect ?? false,
    calculateAeroJump: preferences?.calculateAeroJump ?? false,
    interpolateRange: preferences?.interpolateRange ?? false
  });
  
  // Error state - we'll use this for API error handling
  const [error, setError] = useState<string>('');

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
    setApiKey(value.trim());
  }, [setApiKey]);
  
  // Environment change handler
  const handleEnvironmentChange = useCallback((value: string) => {
    if (value === 'test' || value === 'dev' || value === 'stage' || value === 'prod') {
      const apiStageValue = value as ApiStage;
      setSelectedEnvironment(apiStageValue);
      setApiStage(apiStageValue);
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
    // Update local state
    const updatedOptions = { ...calcOptions, [field]: value };
    setCalcOptions(updatedOptions);
    
    // Create a complete preferences object with the updated field
    // We need to merge with existing preferences to ensure all fields are preserved
    const updatedPreferences = {
      ...preferences,
      [field]: value
    };
    
    updatePreferences(updatedPreferences);
  }, [calcOptions, preferences, updatePreferences]);
  
  // Render the component
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Card>
        <CardHeader title={t('configuration')} />
        <CardContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              aria-label="configuration tabs"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={t('apiSettings')} value="api" />
              <Tab label={t('unitPreferences')} value="units" />
              <Tab label={t('firearmProfile')} value="firearm" />
              <Tab label={t('ammunition')} value="ammo" />
              <Tab label={t('calculationOptions')} value="calcOptions" />
              <Tab label={t('displayOptions')} value="displayOptions" />
            </Tabs>
          </Box>
          
          {activeTab === 'api' && (
            <ApiSettingsTab
              apiKey={inputApiKey}
              onApiKeyChange={handleApiKeyChange}
              environment={selectedEnvironment}
              onEnvironmentChange={handleEnvironmentChange}
              error=""
              t={t}
            />
          )}
          
          {activeTab === 'units' && (
            <UnitPreferencesTab
              preferences={unitPrefsMap}
              onUnitChange={handleUnitChange}
              t={t}
            />
          )}
          
          {activeTab === 'firearm' && (
            <FirearmProfileTab
              profile={localFirearm}
              onFieldChange={handleFirearmChange}
              onMeasurementChange={handleFirearmMeasurementChange}
              t={t}
            />
          )}
          
          {activeTab === 'ammo' && (
            <AmmunitionTab
              ammunition={localAmmo}
              onFieldChange={handleAmmoChange}
              onMeasurementChange={handleAmmoMeasurementChange}
              t={t}
            />
          )}
          
          {activeTab === 'calcOptions' && (
            <CalculationOptionsTab
              options={calcOptions}
              onOptionsChange={handleCalcOptionsChange}
              t={t}
            />
          )}
          
          {activeTab === 'displayOptions' && (
            <DisplayOptionsTab
              t={t}
            />
          )}
          
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ConfigPage;
