import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import es from './locales/es.json';
import it from './locales/it.json';
import pt from './locales/pt.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';

const userLang = navigator.language.split('-')[0];
const supportedLangs = ['en', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl'];
const defaultLang = supportedLangs.includes(userLang) ? userLang : 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    de: { translation: de },
    es: { translation: es },
    it: { translation: it },
    pt: { translation: pt },
    nl: { translation: nl },
    pl: { translation: pl },
  },
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
