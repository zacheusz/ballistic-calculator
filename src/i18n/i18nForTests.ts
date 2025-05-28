import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslation from './en.json';

// Initialize i18n for tests
i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: {
        translation: enTranslation
      }
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
