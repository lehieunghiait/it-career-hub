import { Card, Typography } from 'antd';
const { Title } = Typography;
import { useTranslation } from 'react-i18next';
import parse from 'html-react-parser';
import styles from 'styles/client.module.scss';

interface CompanyDescriptionProps {
  description: string | undefined;
}
const CompanyDescription = ({ description }: CompanyDescriptionProps) => {
  const { t } = useTranslation('companyDetail');
  return (
    <Card
      title={<Title level={4}>{t('Overview.Introduction')}</Title>}
      className={styles['company-description-card']}
    >
      <div className={styles['company-description']}>{parse(description ?? 'No description')}</div>
    </Card>
  );
};
export default CompanyDescription;
