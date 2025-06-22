import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enHeaderClient from './locales/en/header.client.json';
import viHeaderClient from './locales/vi/header.client.json';
import enAbout from './locales/en/about.json';
import viAbout from './locales/vi/about.json';
import enCompanyCard from './locales/en/company/company.card.json';
import viCompanyCard from './locales/vi/company/company.card.json';
import enJobCard from './locales/en/job/job.card.json';
import viJobCard from './locales/vi/job/job.card.json';
import enSearch from './locales/en/search/search.json';
import viSearch from './locales/vi/search/search.json';
import enDetailCompany from './locales/en/company/company.detail.json';
import viDetailCompany from './locales/vi/company/company.detail.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        header: enHeaderClient,
        about: enAbout,
        companyCard: enCompanyCard,
        jobCard: enJobCard,
        search: enSearch,
        companyDetail: enDetailCompany,
      },
      vi: {
        header: viHeaderClient,
        about: viAbout,
        companyCard: viCompanyCard,
        jobCard: viJobCard,
        search: viSearch,
        companyDetail: viDetailCompany,
      },
    },
    fallbackLng: 'en',
    ns: ['header', 'about', 'companyCard', 'jobCard', 'companyDetail'],
    defaultNS: 'jobCard',
    fallbackNS: 'jobCard',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
