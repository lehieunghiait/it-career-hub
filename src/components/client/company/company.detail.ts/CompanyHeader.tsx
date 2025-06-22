import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from 'styles/client.module.scss';
interface CompanyHeaderProps {
  onGoBack: () => void;
}

const CompanyHeader = ({ onGoBack }: CompanyHeaderProps) => {
  const { t } = useTranslation('companyDetail');
  return (
    <div className={styles['company-detail-header']}>
      <Button onClick={onGoBack} icon={<ArrowLeftOutlined />} className={styles['back-button']}>
        {t('Feature.BackToList')}
      </Button>
    </div>
  );
};

export default CompanyHeader;
