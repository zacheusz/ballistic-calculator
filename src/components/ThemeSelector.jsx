import React from 'react';
import { Form } from 'react-bootstrap';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

/**
 * A reusable component for selecting the application theme
 * Uses the ThemeContext to manage theme state
 */
const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Form.Group className="mb-3">
      <Form.Label>{t('theme')}</Form.Label>
      <Form.Select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
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
