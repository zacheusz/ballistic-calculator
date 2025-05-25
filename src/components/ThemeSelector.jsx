import React from 'react';
import { Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAppConfigStore } from '../stores/useAppConfigStore';

/**
 * A reusable component for selecting the application theme
 * Uses the Zustand store exclusively to manage theme state
 */
const ThemeSelector = () => {
  const { t } = useTranslation();
  const { theme, setTheme } = useAppConfigStore();

  const handleChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
  };

  return (
    <Form.Group className="mb-3">
      <Form.Label>{t('theme')}</Form.Label>
      <Form.Select
        value={theme}
        onChange={handleChange}
      >
        <option value="light">{t('light')}</option>
        <option value="dark">{t('dark')}</option>
        <option value="system" disabled>{t('system')}</option>
      </Form.Select>
      <Form.Text className="text-muted">
        {/* Optionally provide a translated helper text if needed */}
      </Form.Text>
    </Form.Group>
  );
};

export default ThemeSelector;
