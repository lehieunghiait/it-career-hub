import { ArrowLeftOutlined, FolderOpenTwoTone } from '@ant-design/icons';
import { Button, Breadcrumb } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';

interface CompanyHeaderProps {
  onGoBack: () => void;
  companyName?: string;
}

const CompanyHeader = ({ onGoBack, companyName }: CompanyHeaderProps) => {
  const { t } = useTranslation('companyDetail');
  return (
    <div className={styles['company-detail-header']}>
      <Breadcrumb
        separator='>'
        items={[
          {
            title: <Link to='/'>{'Home'}</Link>,
          },
          {
            title: <Link to='/company'>{'Companies'}</Link>,
          },
          {
            title: companyName || 'Company Detail',
          },
        ]}
        className={styles['company-breadcrumb']}
      />
      <Button
        onClick={onGoBack}
        icon={<ArrowLeftOutlined />}
        type='link'
        style={{ color: 'red', fontWeight: 500, cursor: 'pointer' }}
        className={styles['back-button']}
      >
        Back to list
      </Button>
    </div>
  );
};

export default CompanyHeader;
