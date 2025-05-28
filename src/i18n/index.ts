import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import pl from './pl.json';

// Define the resources type
interface Resources {
  [key: string]: {
    translation: typeof en;
  };
}

const resources: Resources = {
  en: { translation: en },
  pl: { translation: pl },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
