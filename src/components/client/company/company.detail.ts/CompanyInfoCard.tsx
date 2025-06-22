import { ICompanyDetail } from '@/types/backend';
import {
  EnvironmentOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { Typography } from 'antd';
const { Text } = Typography;
import styles from 'styles/client.module.scss';

interface CompanyInfoCardProps {
  company: ICompanyDetail;
}

const CompanyInfoCard = ({ company }: CompanyInfoCardProps) => {
  return (
    <div className={styles['company-info-container']}>
      <Typography.Title level={3} className={styles['company-name']}>
        {company.name}
      </Typography.Title>

      <div className={styles['company-info-item']}>
        <EnvironmentOutlined className={styles['info-icon']} />
        <Text>{company?.address || 'Not update address'}</Text>
      </div>

      {company.website && (
        <div className={styles['company-info-item']}>
          <GlobalOutlined className={styles['info-icon']} />
          <a href={company.website} target='_blank' rel='noopener noreferrer'>
            {company.website}
          </a>
        </div>
      )}

      {company.phone && (
        <div className={styles['company-info-item']}>
          <PhoneOutlined className={styles['info-icon']} />
          <Text>{company.phone}</Text>
        </div>
      )}

      {company.email && (
        <div className={styles['company-info-item']}>
          <MailOutlined className={styles['info-icon']} />
          <a href={`mailto:${company.email}`}>{company.email}</a>
        </div>
      )}
    </div>
  );
};

export default CompanyInfoCard;
