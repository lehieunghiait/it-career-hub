import { Fragment, PropsWithChildren } from 'react';
import { ConfigProvider } from 'antd';
import type { Locale } from 'antd/es/locale';
import viVN from 'antd/locale/vi_VN';
import enUS from 'antd/locale/en_US';
import jaJP from 'antd/locale/ja_JP';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'dayjs/locale/ja';
import 'dayjs/locale/en';
import { useTranslation } from 'react-i18next';
import { AppLanguage, DEFAULT_LANGUAGE } from '.';

const ANTD_LOCALES: Record<AppLanguage, Locale> = { vi: viVN, en: enUS, ja: jaJP };

/**
 * - Đồng bộ locale của Ant Design / ProComponents và dayjs theo ngôn ngữ hiện tại.
 * - Remount cây con khi đổi ngôn ngữ (key = lng) để mọi chỗ gọi i18next.t(...) render lại,
 *   kể cả component không dùng hook useTranslation.
 */
export default function AppLocaleProvider({ children }: PropsWithChildren) {
  const { i18n } = useTranslation();
  const lng = ((i18n.resolvedLanguage as AppLanguage) in ANTD_LOCALES
    ? i18n.resolvedLanguage
    : DEFAULT_LANGUAGE) as AppLanguage;

  dayjs.locale(lng);

  return (
    <ConfigProvider locale={ANTD_LOCALES[lng]}>
      <Fragment key={lng}>{children}</Fragment>
    </ConfigProvider>
  );
}
