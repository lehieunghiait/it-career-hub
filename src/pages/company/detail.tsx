import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ICompany } from '@/types/backend';
import { callFetchCompanyById } from '@/config/api';
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import { Button, Card, Col, Row, Skeleton, Typography, Tag } from 'antd';
import {
  EnvironmentOutlined,
  GlobalOutlined,
  PhoneOutlined,
  MailOutlined,
  TeamOutlined,
  BankOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

// Sử dụng interface mở rộng từ ICompany để thêm các thuộc tính mới
interface ICompanyDetail extends ICompany {
  website?: string;
  phone?: string;
  email?: string;
  size?: string | number;
  companyType?: string;
  skills?: string[];
}

const ClientCompanyDetailPage = (props: any) => {
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

  return (
    <div className={`${styles['container']} ${styles['company-detail-page']}`}>
      <div className={styles['company-detail-header']}>
        <Button
          onClick={handleGoBack}
          icon={<ArrowLeftOutlined />}
          className={styles['back-button']}
        >
          Quay lại danh sách công ty
        </Button>
      </div>

      {isLoading ? (
        <Card className={styles['company-detail-skeleton']}>
          <Skeleton active avatar paragraph={{ rows: 6 }} />
        </Card>
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
                      <Text>{companyDetail?.address || 'Chưa cập nhật địa chỉ'}</Text>
                    </div>

                    {companyDetail.website && (
                      <div className={styles['company-info-item']}>
                        <GlobalOutlined className={styles['info-icon']} />
                        <a href={companyDetail.website} target='_blank' rel='noopener noreferrer'>
                          {companyDetail.website}
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
                          <div className={styles['stat-label']}>Nhân viên</div>
                        </div>
                      </div>

                      <div className={styles['stat-item']}>
                        <BankOutlined className={styles['stat-icon']} />
                        <div className={styles['stat-content']}>
                          <div className={styles['stat-value']}>
                            {companyDetail.companyType || 'N/A'}
                          </div>
                          <div className={styles['stat-label']}>Loại hình</div>
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
                          <div className={styles['stat-label']}>Thành lập</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col xs={24} md={16} className={styles['company-profile-right']}>
                  <Card
                    title={<Title level={4}>Giới thiệu công ty</Title>}
                    className={styles['company-description-card']}
                  >
                    <div className={styles['company-description']}>
                      {parse(
                        companyDetail?.description ?? 'Chưa có thông tin giới thiệu về công ty'
                      )}
                    </div>
                  </Card>
                </Col>
              </Row>
            </Card>

            {companyDetail.skills && companyDetail.skills.length > 0 && (
              <Card
                className={styles['company-skills-card']}
                title={<Title level={4}>Công nghệ & Kỹ năng</Title>}
              >
                <div className={styles['skills-container']}>
                  {companyDetail.skills.map((skill, index) => (
                    <Tag key={index} className={styles['skill-tag']}>
                      {skill}
                    </Tag>
                  ))}
                </div>
              </Card>
            )}
          </>
        )
      )}
    </div>
  );
};

export default ClientCompanyDetailPage;
