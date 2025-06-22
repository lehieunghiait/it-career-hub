import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ICompanyDetail } from '@/types/backend';
import { callFetchCompanyById } from '@/config/api';
import styles from 'styles/client.module.scss';
import { Card, Col, Row, Typography, Carousel } from 'antd';
const { Title } = Typography;

import {
  EnvironmentOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  BankOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import CompanyHeader from '@/components/client/company/company.detail.ts/CompanyHeader';
import CompanySkills from '@/components/client/company/company.detail.ts/CompanySkills';
import CompanyDetailSkeleton from '@/components/client/company/company.detail.ts/CompanyDetailSkeleton';
import CompanyDescription from '@/components/client/company/company.detail.ts/CompanyDescription';
import CompanyProfile from '@/components/client/company/company.detail.ts/CompanyProfile';
import CompanyCarousel from '@/components/client/company/company.detail.ts/CompanyCarousel';

const images = [
  'https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBNmhMUFE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--088fec3df7eefb9dbf5bb0a3fee94c68bdb86faa/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBPZ2wzWldKd09oTnlaWE5wZW1WZmRHOWZabWxzYkZzSGFRS2VBbWtDdlFFPSIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--22ae3c60c8cd4ceb8906930c6fd9de4e83ffa644/MicrosoftTeams-image%20(1).png',
  'https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBMExFVXc9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--b8b35cbf897f4bdd659d1e169b374173b95976c8/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBPZ2wzWldKd09oTnlaWE5wZW1WZmRHOWZabWxzYkZzSGFRS2VBbWtDdlFFPSIsImV4cCI6bnVsbCwicHVyIjoidmFyaWF0aW9uIn19--22ae3c60c8cd4ceb8906930c6fd9de4e83ffa644/5f0aab3cecfe48a011ef.jpg',
];

const ClientCompanyDetailPage = () => {
  const { t } = useTranslation('companyDetail');
  const [companyDetail, setCompanyDetail] = useState<ICompanyDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const id = params?.get('id'); // company id

  useEffect(() => {
    const init = async () => {
      if (id) {
        setIsLoading(true);
        const res = await callFetchCompanyById(id);
        if (res?.data) {
          setCompanyDetail(res.data);
        }
        setIsLoading(false);
      }
    };
    init();
  }, [id]);

  const handleGoBack = () => {
    navigate('/company');
  };

  const skills = companyDetail?.skills || ['Computer', 'Engineering', 'IT'];
  return (
    <div className={`${styles['container']} ${styles['company-detail-page']}`}>
      <CompanyHeader onGoBack={handleGoBack} />

      {isLoading ? (
        <CompanyDetailSkeleton />
      ) : (
        companyDetail &&
        companyDetail._id && (
          <>
            <CompanyProfile company={companyDetail} />
            {/* <Card className={styles['company-detail-card']}>
              <Row gutter={[24, 24]} className={styles['company-profile']}>
                <Col xs={24} md={8} className={styles['company-profile-left']}>
                  <div className={styles['company-logo-container']}>
                    <img
                      alt={companyDetail.name}
                      src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${companyDetail?.logo}`}
                      className={styles['company-logo']}
                    />
                  </div>
                  <div className={styles['company-info-container']}>
                    <Title level={3} className={styles['company-name']}>
                      {companyDetail.name}
                    </Title>

                    <div className={styles['company-info-item']}>
                      <EnvironmentOutlined className={styles['info-icon']} />
                      <Text>{companyDetail?.address || 'N/A'}</Text>
                    </div>

                    {companyDetail.website && (
                      <div className={styles['company-info-item']}>
                        <GlobalOutlined className={styles['info-icon']} />
                        <a href={companyDetail.website} target='_blank' rel='noopener noreferrer'>
                          {companyDetail.website || 'Not update website'}
                        </a>
                      </div>
                    )}

                    {companyDetail.phone && (
                      <div className={styles['company-info-item']}>
                        <PhoneOutlined className={styles['info-icon']} />
                        <Text>{companyDetail.phone}</Text>
                      </div>
                    )}

                    {companyDetail.email && (
                      <div className={styles['company-info-item']}>
                        <MailOutlined className={styles['info-icon']} />
                        <a href={`mailto:${companyDetail.email}`}>{companyDetail.email}</a>
                      </div>
                    )}

                    <div className={styles['company-stats']}>
                      <div className={styles['stat-item']}>
                        <TeamOutlined className={styles['stat-icon']} />
                        <div className={styles['stat-content']}>
                          <div className={styles['stat-value']}>{companyDetail.size || 'N/A'}</div>
                          <div className={styles['stat-label']}>{t('Overview.NumberOfStaff')}</div>
                        </div>
                      </div>

                      <div className={styles['stat-item']}>
                        <BankOutlined className={styles['stat-icon']} />
                        <div className={styles['stat-content']}>
                          <div className={styles['stat-value']}>
                            {companyDetail.companyType || 'Computer'}
                          </div>
                          <div className={styles['stat-label']}>{t('Overview.TypeOfBusiness')}</div>
                        </div>
                      </div>

                      <div className={styles['stat-item']}>
                        <CalendarOutlined className={styles['stat-icon']} />
                        <div className={styles['stat-content']}>
                          <div className={styles['stat-value']}>
                            {companyDetail.createdAt
                              ? new Date(companyDetail.createdAt).getFullYear()
                              : 'N/A'}
                          </div>
                          <div className={styles['stat-label']}>
                            {t('Overview.YearOfFoundation')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={24} md={16} className={styles['company-profile-right']}>
                  <CompanyDescription description={companyDetail.description} />
                </Col>
              </Row>
            </Card> */}

            {skills && skills.length > 0 && <CompanySkills skills={skills} />}
            <CompanyCarousel images={images || []} loading={isLoading} />
          </>
        )
      )}
    </div>
  );
};

export default ClientCompanyDetailPage;
