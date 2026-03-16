import i18n from "i18next";
import { initReactI18next } from "react-i18next";
// Optional:
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en/translation.json";
import ar from "./locales/ar/translation.json";

const resources = {
    en: { translation: en },
    ar: { translation: ar },
};

i18n
    // Optional language detection (localStorage, browser, etc.)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: "en",
        supportedLngs: ["en", "ar"],
        // If you DON'T want detection, you can set: lng: "en"
        interpolation: {
            escapeValue: false, // React already escapes
        },
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
        },
    });

// Optional: handle RTL/LTR automatically
const setDocumentDir = (lng) => {
    document.documentElement.lang = lng;
    document.documentElement.dir = "ltr";
};

setDocumentDir(i18n.language);
i18n.on("languageChanged", setDocumentDir);

export default i18n;