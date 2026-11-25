import { Card, Typography, Empty } from 'antd';
const { Title } = Typography;
import { useTranslation } from 'react-i18next';
import parse from 'html-react-parser';
import styles from 'styles/client.module.scss';
import { InfoCircleOutlined } from '@ant-design/icons';

import i18next from 'i18next';

interface CompanyDescriptionProps {
  description: string | undefined;
}

const CompanyDescription = ({ description }: CompanyDescriptionProps) => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <InfoCircleOutlined style={{ color: '#1677ff' }} />
          <Title level={4} style={{ margin: 0 }}>
            {i18next.t('app:components.client.company.company_detail_ts.CompanyDescription.overview')}
          </Title>
        </div>
      }
      className={styles['company-description-card']}
      bordered={false}
    >
      {description ? (
        <div className={styles['company-description']}>{parse(description)}</div>
      ) : (
        <Empty description={i18next.t('app:components.client.company.company_detail_ts.CompanyDescription.no_description_available')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      )}
    </Card>
  );
};

export default CompanyDescription;
