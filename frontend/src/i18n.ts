import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enDashboard from "@/locales/en/dashboard.json";
import arDashboard from "@/locales/ar/dashboard.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "ar"],
    debug: import.meta.env.DEV,
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        dashboard: enDashboard,
      },
      ar: {
        dashboard: arDashboard,
      },
    },
    defaultNS: "dashboard",
    ns: ["dashboard"],
  });

export default i18n;

