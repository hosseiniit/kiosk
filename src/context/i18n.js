import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpApi from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import global_fa from "../translations/fa/global.json";
import global_en from "../translations/en/global.json";
i18n
  .use(initReactI18next)
  .use(HttpApi)
  .use(LanguageDetector)
  .init({
    lng: "fa", // زبان پیش‌فرض
    fallbackLng: "en", // زبان پشتیبانی شده در صورت عدم تطابق
    debug: true, // حالت دیباگ را فعال کنید

    interpolation: {
      escapeValue: false, // اسکیپ ترجمه‌ها را غیرفعال کنید
    },
    resources: {
      fa: {
        global: global_fa,
      },
      en: {
        global: global_en,
      },
    },
  });

export default i18n;
