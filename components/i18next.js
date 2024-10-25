import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import de from "../components/i18n/de.json";
import en from "../components/i18n/en.json";
import zh from "../components/i18n/zh.json";

export const languageResources = {
    de: {translation: de},
    en: {translation: en},
    zh: {translation: zh},
}

i18next.use(initReactI18next).init({
    compatibilityJSON:"v3",
    lng: 'en',
    fallbacklng: 'en',
    resources: languageResources,
})

export default i18next;
