import { ICompanyDetail } from '@/types/backend';
import { Card, Row, Col } from 'antd';
import styles from 'styles/client.module.scss';
import CompanyInfoCard from './CompanyInfoCard';
import CompanyDescription from './CompanyDescription';

interface CompanyProfileProps {
  company: ICompanyDetail;
}

const CompanyProfile = ({ company }: CompanyProfileProps) => {
  return (
    <Card className={styles['company-detail-card']} bordered={false}>
      <Row gutter={[32, 32]} className={styles['company-profile']}>
        <Col xs={24} lg={8} className={styles['company-profile-left']}>
          <div className={styles['company-logo-container']}>
            <img src={company.logo} alt={company.name} className={styles['company-logo']} />
          </div>
          <CompanyInfoCard company={company} />
        </Col>
        <Col xs={24} lg={16} className={styles['company-profile-right']}>
          <CompanyDescription description={company.description} />
        </Col>
      </Row>
    </Card>
  );
};

export default CompanyProfile;
