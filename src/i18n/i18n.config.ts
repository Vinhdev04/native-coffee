/**
 * @file i18n.config.ts
 * @desc Cấu hình đa ngôn ngữ (i18next) — khởi tạo ngôn ngữ mặc
 *       định (vi), tải bản dịch vi.json và en.json tự động.
 * @layer i18n
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import vi from './locales/vi.json';

const resources = {
  en: { translation: en },
  vi: { translation: vi },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'vi',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
