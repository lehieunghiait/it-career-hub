import { ICompanyDetail } from '@/types/backend';
import { Card, Row, Col } from 'antd';
import styles from 'styles/client.module.scss';
import CompanyInfoCard from './CompanyInfoCard';
import CompanyStats from './CompanyStats';
import CompanyDescription from './CompanyDescription';

interface CompanyProfileProps {
  company: ICompanyDetail;
}

const CompanyProfile = ({ company }: CompanyProfileProps) => {
  return (
    <Card className={styles['company-detail-card']}>
      <Row gutter={[24, 24]} className={styles['company-profile']}>
        <Col xs={24} md={8} className={styles['company-profile-left']}>
          <div className={styles['company-logo-container']}>
            <img
              alt={company.name}
              src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${company?.logo}`}
              className={styles['company-logo']}
            />
          </div>
          <CompanyInfoCard company={company} />
          <CompanyStats company={company} />
        </Col>

        <Col xs={24} md={16} className={styles['company-profile-right']}>
          <CompanyDescription description={company.description} />
        </Col>
      </Row>
    </Card>
  );
};

export default CompanyProfile;
