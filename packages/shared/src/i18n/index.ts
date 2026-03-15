import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en';
import no from './no';
import cn from './cn';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      no: { translation: no },
      zh: { translation: cn },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
