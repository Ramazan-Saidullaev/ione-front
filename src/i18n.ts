import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ru from "./messages/ru.json";
import kz from "./messages/kz.json";
import en from "./messages/en.json";

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    kz: { translation: kz },
    en: { translation: en }
  },
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
