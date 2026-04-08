import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import vi from "./locales/vi.json";
import ja from "./locales/ja.json"

i18n
  .use(LanguageDetector) // detect browser language
  .use(initReactI18next)
  .init({
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"]
    },
    resources: {
      en: { translation: en },
      vi: { translation: vi },
      ja: { translation: ja }
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;