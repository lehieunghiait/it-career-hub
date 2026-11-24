import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const SUPPORTED_LANGUAGES = [
  { code: 'vi', label: 'Tiếng Việt', short: 'VI', flag: '🇻🇳' },
  { code: 'en', label: 'English', short: 'EN', flag: '🇬🇧' },
  { code: 'ja', label: '日本語', short: 'JA', flag: '🇯🇵' },
] as const;

export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]['code'];
export const DEFAULT_LANGUAGE: AppLanguage = 'vi';

/**
 * Tự nạp mọi file JSON trong ./locales/<lang>/**.
 * Namespace = tên file (bỏ .json). Một số file cũ giữ tên namespace cũ qua NS_ALIAS.
 * Thêm ngôn ngữ mới: tạo thư mục locales/<lang>/ với cùng cấu trúc + khai báo trong SUPPORTED_LANGUAGES.
 */
const NS_ALIAS: Record<string, string> = {
  'header.client': 'header',
  'company.card': 'companyCard',
  'company.detail': 'companyDetail',
  'job.card': 'jobCard',
};

const modules = import.meta.glob('./locales/*/**/*.json', { eager: true, import: 'default' }) as Record<
  string,
  Record<string, unknown>
>;

const resources: Record<string, Record<string, Record<string, unknown>>> = {};
for (const [file, data] of Object.entries(modules)) {
  const m = file.match(/^\.\/locales\/([^/]+)\/(?:.*\/)?([^/]+)\.json$/);
  if (!m) continue;
  const [, lng, name] = m;
  const ns = NS_ALIAS[name] ?? name;
  (resources[lng] ||= {})[ns] = data;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: SUPPORTED_LANGUAGES.map(l => l.code),
    nonExplicitSupportedLngs: true, // en-US -> en, ja-JP -> ja
    load: 'languageOnly',
    fallbackLng: { ja: ['en', 'vi'], en: ['vi'], default: [DEFAULT_LANGUAGE] },
    ns: Array.from(new Set(Object.values(resources).flatMap(r => Object.keys(r)))),
    defaultNS: 'jobCard',
    fallbackNS: ['jobCard', 'app'],
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'lang',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  });

const syncHtmlLang = (lng?: string) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng || DEFAULT_LANGUAGE;
};
syncHtmlLang(i18n.resolvedLanguage);
i18n.on('languageChanged', syncHtmlLang);

export const currentLanguage = (): AppLanguage =>
  ((i18n.resolvedLanguage || DEFAULT_LANGUAGE) as AppLanguage);

export default i18n;
