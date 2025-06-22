import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ICompanyDetail } from '@/types/backend';
import { callFetchCompanyById } from '@/config/api';
import styles from 'styles/client.module.scss';
import { Card, Col, Row, Typography } from 'antd';
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

const { Title, Text } = Typography;

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
      {/* Button back */}
      <CompanyHeader onGoBack={handleGoBack} />

      {isLoading ? (
        <CompanyDetailSkeleton />
      ) : (
        companyDetail &&
        companyDetail._id && (
          <>
            <Card className={styles['company-detail-card']}>
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
            </Card>

            {skills && skills.length > 0 && <CompanySkills skills={skills} />}
          </>
        )
      )}
    </div>
  );
};

export default ClientCompanyDetailPage;
