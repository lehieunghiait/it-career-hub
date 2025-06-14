import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { IJob } from '@/types/backend';
import { callFetchJobById } from '@/config/api';
import styles from 'styles/client.module.scss';
import parse from 'html-react-parser';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Skeleton,
  Tag,
  Typography,
  Space,
  message,
} from 'antd';
import {
  DollarOutlined,
  EnvironmentOutlined,
  HistoryOutlined,
  BankOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  HeartOutlined,
  ShareAltOutlined,
  SendOutlined,
  PrinterOutlined,
} from '@ant-design/icons';
import { getLocationName } from '@/config/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ApplyModal from '@/components/client/modal/apply.modal';
dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const ClientJobDetailPage = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const id = params?.get('id');

  useEffect(() => {
    const init = async () => {
      if (id) {
        setIsLoading(true);
        const res = await callFetchJobById(id);
        if (res?.data) {
          setJobDetail(res.data);
          // Scroll to top when new job loads
          window.scrollTo(0, 0);
        }
        setIsLoading(false);
      }
    };
    init();
  }, [id]);

  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    message.success(isSaved ? 'Đã xóa khỏi danh sách công việc đã lưu' : 'Đã lưu công việc này');
  };

  const handleShareJob = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Đã sao chép liên kết vào clipboard');
  };

  const handlePrintJob = () => {
    window.print();
  };

  const renderJobDetail = () => {
    if (!jobDetail || !jobDetail._id) return null;

    return (
      <>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card className={styles['job-header-card']} bordered={false}>
              <Row gutter={[16, 16]} align='middle'>
                <Col xs={24} sm={4} md={3} lg={2}>
                  <Avatar
                    src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${jobDetail.company?.logo}`}
                    shape='square'
                    size={80}
                    className={styles['company-logo']}
                  />
                </Col>
                <Col xs={24} sm={20} md={21} lg={22}>
                  <Title level={2} className={styles['job-title']}>
                    {jobDetail.name}
                  </Title>
                  <Space className={styles['company-info']}>
                    <BankOutlined />
                    <Text strong>{jobDetail.company?.name}</Text>
                  </Space>
                  <div className={styles['job-actions']}>
                    <Button
                      type='primary'
                      size='large'
                      icon={<SendOutlined />}
                      onClick={() => setIsModalOpen(true)}
                      className={styles['btn-apply-header']}
                    >
                      Rải CV đi người đẹp 😍
                    </Button>
                    <Button
                      icon={<HeartOutlined />}
                      className={`${styles['btn-save']} ${isSaved ? styles['saved'] : ''}`}
                      onClick={handleSaveJob}
                    >
                      {isSaved ? 'Saved' : 'Save'}
                    </Button>
                    <Button icon={<ShareAltOutlined />} onClick={handleShareJob}>
                      Share
                    </Button>
                    <Button icon={<PrinterOutlined />} onClick={handlePrintJob}>
                      Print
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card
              className={styles['job-detail-card']}
              title={<Title level={4}>Chi tiết công việc</Title>}
              bordered={false}
            >
              <Row gutter={[16, 24]}>
                <Col span={24}>
                  <div className={styles['job-overview']}>
                    <div className={styles['overview-item']}>
                      <DollarOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Salary</Text>
                        <Text strong className={styles['value']}>
                          {(jobDetail.salary + '')?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                        </Text>
                      </div>
                    </div>
                    <div className={styles['overview-item']}>
                      <EnvironmentOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Location</Text>
                        <Text strong className={styles['value']}>
                          {getLocationName(jobDetail.location)}
                        </Text>
                      </div>
                    </div>
                    <div className={styles['overview-item']}>
                      <ClockCircleOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Loại công việc</Text>
                        <Text strong className={styles['value']}>
                          Full Time
                        </Text>
                      </div>
                    </div>
                    <div className={styles['overview-item']}>
                      <TeamOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Cấp bậc</Text>
                        <Text strong className={styles['value']}>
                          {jobDetail.level || 'All Levels'}
                        </Text>
                      </div>
                    </div>
                    <div className={styles['overview-item']}>
                      <HistoryOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Ngày đăng</Text>
                        <Text strong className={styles['value']}>
                          {dayjs(jobDetail.updatedAt).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Col>

                <Col span={24}>
                  <div className={styles['skills-section']}>
                    <Title level={5}>
                      <TagsOutlined /> Kỹ năng cần thiết
                    </Title>
                    <div className={styles['skills']}>
                      {jobDetail?.skills?.map((item, index) => (
                        <Tag key={`${index}-key`} color='blue' className={styles['skill-tag']}>
                          {item}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Col>

                <Col span={24}>
                  <Title level={5}>Job Description</Title>
                  <div className={styles['job-description']}>{parse(jobDetail.description)}</div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card
              className={styles['company-card']}
              title={
                <Title level={4}>
                  <BankOutlined /> Company Info
                </Title>
              }
              bordered={false}
            >
              <div className={styles['company-detail']}>
                <Avatar
                  src={`${import.meta.env.VITE_BACKEND_URL}/images/company/${jobDetail.company?.logo}`}
                  shape='square'
                  size={100}
                  className={styles['company-logo-lg']}
                />
                <Title level={4} className={styles['company-name']}>
                  {jobDetail.company?.name}
                </Title>

                <Divider />

                <div className={styles['company-info-item']}>
                  <GlobalOutlined className={styles['icon']} />
                  <Text className={styles['value']}>
                    <a href='#' target='_blank' rel='noopener noreferrer'>
                      company.com
                    </a>
                  </Text>
                </div>

                <div className={styles['company-info-item']}>
                  <MailOutlined className={styles['icon']} />
                  <Text className={styles['value']}>contact@company.com</Text>
                </div>

                <div className={styles['company-info-item']}>
                  <PhoneOutlined className={styles['icon']} />
                  <Text className={styles['value']}>+84 xxx xxx xxx</Text>
                </div>

                <div className={styles['company-info-item']}>
                  <EnvironmentOutlined className={styles['icon']} />
                  <Text className={styles['value']}>Ho Chi Minh City, Vietnam</Text>
                </div>

                <Divider />

                {/* <Button 
                                    type="default" 
                                    block
                                    onClick={() => navigate(`/company/${jobDetail.company?._id}`)}
                                    className={styles["btn-view-company"]}
                                >
                                    Xem hồ sơ công ty
                                </Button> */}
              </div>
            </Card>

            {/* <Card 
                            className={styles["apply-card"]} 
                            title={<Title level={4}><CheckCircleOutlined /> Ứng tuyển nhanh</Title>} 
                            bordered={false}
                        >
                            <Paragraph>
                                Bạn đã sẵn sàng ứng tuyển cho công việc này? Nhấn nút dưới đây để gửi đơn ứng tuyển của bạn.
                            </Paragraph>
                            <Button 
                                type="primary" 
                                block 
                                size="large"
                                onClick={() => setIsModalOpen(true)}
                                className={styles["btn-apply-card"]}
                            >
                                Ứng tuyển ngay
                            </Button>   
                        </Card> */}
          </Col>
        </Row>
      </>
    );
  };

  return (
    <div className={`${styles['container']} ${styles['detail-job-section']}`}>
      {isLoading ? (
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Skeleton active avatar paragraph={{ rows: 1 }} />
          </Col>
          <Col xs={24} md={16}>
            <Skeleton active paragraph={{ rows: 10 }} />
          </Col>
          <Col xs={24} md={8}>
            <Skeleton active paragraph={{ rows: 6 }} />
          </Col>
        </Row>
      ) : (
        renderJobDetail()
      )}
      <ApplyModal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} jobDetail={jobDetail} />
    </div>
  );
};

export default ClientJobDetailPage;
