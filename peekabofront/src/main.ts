import { createApp } from "vue";
import App from "./App.vue";
import router from "./router"; // Import Vue Router
import { VueQueryPlugin } from "@tanstack/vue-query";
import { createI18n } from "vue-i18n";

import './style.css';

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import es from "./locales/es.json";
import it from "./locales/it.json";
import pt from "./locales/pt.json";
import nl from "./locales/nl.json";
import pl from "./locales/pl.json";

// Détecter la langue du navigateur
const userLang = navigator.language.split("-")[0]; // Ex: "fr" si "fr-FR"
const supportedLangs = ["en", "fr", "de", "es", "it", "pt", "nl", "pl"];
const defaultLang = supportedLangs.includes(userLang) ? userLang : "en";

// Créer une instance de i18n avec TypeScript configuration
const i18n = createI18n({
  legacy: false, // Important pour utiliser le Composition API
  locale: defaultLang, // Définit la langue du navigateur
  fallbackLocale: "en",
  globalInjection: true, // Permet d'utiliser `$t` partout sans import
  messages: { en, fr, de, es, it, pt, nl, pl }
});

// Créer et monter l'application Vue
const app = createApp(App);
app.use(VueQueryPlugin);
app.use(router);
app.use(i18n);
app.mount("#app");
