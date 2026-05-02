import { createI18n } from "vue-i18n"

import en from "./en.json"
import sk from "./sk.json"

// here I18n instance is created to manage text translations on pages
const i18n = createI18n({
    legacy: false,                                      // required for Composition API
    locale: localStorage.getItem("lang") || "en",  // currently selected language (hardcoded english for now)
    fallbackLocale: "en",                               // fallback if missing translation
    messages: {                                         // a dictionary of dictionaries
        en,
        sk
    }
})

export default i18n