import styles from 'styles/client.module.scss';
import { TeamOutlined, BankOutlined, CalendarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { ICompanyDetail } from '@/types/backend';

interface CompanyStatsProps {
  company: ICompanyDetail;
}

const CompanyStats = ({ company }: CompanyStatsProps) => {
  const { t } = useTranslation('companyDetail');

  return (
    <div className={styles['company-stats']}>
      <div className={styles['stat-item']}>
        <TeamOutlined className={styles['stat-icon']} />
        <div className={styles['stat-content']}>
          <div className={styles['stat-value']}>{company.size || 'N/A'}</div>
          <div className={styles['stat-label']}>{t('Overview.NumberOfStaff')}</div>
        </div>
      </div>

      <div className={styles['stat-item']}>
        <BankOutlined className={styles['stat-icon']} />
        <div className={styles['stat-content']}>
          <div className={styles['stat-value']}>{company.companyType || 'Computer'}</div>
          <div className={styles['stat-label']}>{t('Overview.TypeOfBusiness')}</div>
        </div>
      </div>

      <div className={styles['stat-item']}>
        <CalendarOutlined className={styles['stat-icon']} />
        <div className={styles['stat-content']}>
          <div className={styles['stat-value']}>
            {company.createdAt ? new Date(company.createdAt).getFullYear() : 'N/A'}
          </div>
          <div className={styles['stat-label']}>{t('Overview.YearOfFoundation')}</div>
        </div>
      </div>
    </div>
  );
};

export default CompanyStats;
