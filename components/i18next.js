import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import de from "../components/i18n/de.json";
import en from "../components/i18n/en.json";
import zh from "../components/i18n/zh.json";

// Define the language resources for i18next (maps language code to the corresponding translation file)
export const languageResources = {
    de: {translation: de}, // German translations
    en: {translation: en}, // English translations
    zh: {translation: zh}, // Chinese translations
}

// Initialize i18next with configuration options
i18next.use(initReactI18next).init({
    compatibilityJSON:"v3", // Ensures compatibility with i18next v3 features
    lng: 'en', // Default language to load (English)
    fallbacklng: 'en', // Fallback language in case the selected language is not available
    resources: languageResources, // Pass the language resources object defined earlier
})

// Export the configured i18next instance for use in the application
export default i18next;