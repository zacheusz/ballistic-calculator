import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-bootstrap';

/**
 * LanguageSelector: allows user to switch between English and Polish
 */
const LanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language || 'en';

  const handleChange = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <Form.Group className="mb-3" style={{ minWidth: 150 }}>
      <Form.Label>{t('language')}</Form.Label>
      <Form.Select value={currentLang} onChange={handleChange} size="sm">
        <option value="en">{t('english')}</option>
        <option value="pl">{t('polish')}</option>
      </Form.Select>
      <Form.Text className="text-muted">
        {t('selectLanguage')}
      </Form.Text>
    </Form.Group>
  );
};

export default LanguageSelector;
