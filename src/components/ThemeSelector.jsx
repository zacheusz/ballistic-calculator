import React from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

/**
 * A reusable component for selecting the application theme
 * Uses the ThemeContext to directly manage theme state
 */
const ThemeSelector = ({ value: externalValue, onChange: externalOnChange }) => {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  
  // Use the value from props if provided, otherwise use theme from context
  const value = externalValue !== undefined ? externalValue : theme;
  
  const handleChange = (e) => {
    const newTheme = e.target.value;
    
    // Update theme context directly
    setTheme(newTheme);
    
    // Also call external onChange if provided
    if (externalOnChange) {
      externalOnChange(e);
    }
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{t('theme')}</Form.Label>
      <Form.Select
        value={value}
        onChange={handleChange}
      >
        <option value="light">{t('light')}</option>
        <option value="dark">{t('dark')}</option>
        <option value="system">{t('system')}</option>
      </Form.Select>
      <Form.Text className="text-muted">
        {/* Optionally provide a translated helper text if needed */}
      </Form.Text>
    </Form.Group>
  );
};

export default ThemeSelector;
