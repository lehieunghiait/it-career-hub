import { Dropdown, MenuProps } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/i18n';

interface IProps {
  /** 'light' cho nền tối (header client), 'dark' cho nền sáng (admin) */
  theme?: 'light' | 'dark';
  /** Chỉ hiện cờ + mã (VI/EN/JA) thay vì tên đầy đủ */
  compact?: boolean;
}

const LanguageSwitcher = ({ theme = 'dark', compact = true }: IProps) => {
  const { i18n } = useTranslation();
  const current = SUPPORTED_LANGUAGES.find(l => l.code === i18n.resolvedLanguage) ?? SUPPORTED_LANGUAGES[0];

  const items: MenuProps['items'] = SUPPORTED_LANGUAGES.map(l => ({
    key: l.code,
    label: (
      <span>
        <span style={{ marginRight: 8 }}>{l.flag}</span>
        {l.label}
      </span>
    ),
  }));

  return (
    <Dropdown
      trigger={['click']}
      placement='bottomRight'
      menu={{
        items,
        selectable: true,
        selectedKeys: [current.code],
        onClick: ({ key }) => i18n.changeLanguage(key),
      }}
    >
      <button
        type='button'
        aria-label='Language'
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          background: 'transparent',
          color: theme === 'light' ? '#fff' : 'inherit',
          border: `1px solid ${theme === 'light' ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.15)'}`,
        }}
      >
        <GlobalOutlined />
        <span>{current.flag}</span>
        <span>{compact ? current.short : current.label}</span>
      </button>
    </Dropdown>
  );
};

export default LanguageSwitcher;
