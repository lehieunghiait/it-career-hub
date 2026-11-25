import { ICompanyDetail } from '@/types/backend';
import {
  EnvironmentOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Typography, Space, Divider } from 'antd';
const { Text, Title } = Typography;
import styles from 'styles/client.module.scss';

import i18next from 'i18next';

interface CompanyInfoCardProps {
  company: ICompanyDetail;
}

const CompanyInfoCard = ({ company }: CompanyInfoCardProps) => {
  return (
    <div className={styles['company-info-container']}>
      <Title level={3} className={styles['company-name']}>
        {company.name}
      </Title>

      <Divider style={{ margin: '16px 0' }} />

      <Space direction='vertical' size='middle' style={{ width: '100%' }}>
        <div className={styles['company-info-item']}>
          <EnvironmentOutlined className={styles['info-icon']} />
          <Text
            className={styles['info-text']}
            style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}
          >
            {company?.address || i18next.t('app:components.client.company.company_detail_ts.CompanyInfoCard.address_not_updated')}
          </Text>
        </div>
        {/* wesbite */}
        {company.website && (
          <div className={styles['company-info-item']}>
            <GlobalOutlined className={styles['info-icon']} />
            <a
              href={company.website}
              target='_blank'
              rel='noopener nofollow noreferrer'
              className={styles['info-link']}
              title={company.website}
            >
              {company.website.replace(/(^\w+:|^)\/\//, '')}
            </a>
          </div>
        )}
        {/* Phone */}
        {company.phone && (
          <div className={styles['company-info-item']}>
            <PhoneOutlined className={styles['info-icon']} />
            <a href={`tel:${company.phone}`} className={styles['info-link']} title={company.phone}>
              {company.phone}
            </a>
          </div>
        )}

        {company.email && (
          <div className={styles['company-info-item']}>
            <MailOutlined className={styles['info-icon']} />
            <a href={`mailto:${company.email}`} className={styles['info-link']}>
              {company.email}
            </a>
          </div>
        )}
      </Space>
    </div>
  );
};

export default CompanyInfoCard;
