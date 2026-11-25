import { ArrowLeftOutlined, FolderOpenTwoTone } from '@ant-design/icons';
import { Button, Breadcrumb } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styles from 'styles/client.module.scss';

import i18next from 'i18next';

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
            title: <Link to='/'>{i18next.t('app:common.home')}</Link>,
          },
          {
            title: <Link to='/company'>{i18next.t('app:common.companies')}</Link>,
          },
          {
            title: companyName || i18next.t('app:components.client.company.company_detail_ts.CompanyHeader.company_detail'),
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
        {i18next.t('app:components.client.company.company_detail_ts.CompanyHeader.back_to_list')}
      </Button>
    </div>
  );
};

export default CompanyHeader;
