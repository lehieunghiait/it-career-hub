import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ICompanyDetail, IJob } from '@/types/backend';
import { callFetchJobById, callFetchCompanyById } from '@/config/api';
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
  ShareAltOutlined,
  SendOutlined,
  PrinterOutlined,
  WarningOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { getLocationName } from '@/config/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ApplyModal from '@/components/client/modal/apply.modal';
import SaveJobButton from '@/components/client/job/SaveJobButton';
import { useAppSelector } from '@/redux/hooks';
import { RESUME_STATUS, ResumeStatus } from '@/config/resume-status';
import 'dayjs/locale/vi';
dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const ClientJobDetailPage = () => {
  const [jobDetail, setJobDetail] = useState<IJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [companyDetail, setCompanyDetail] = useState<ICompanyDetail | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const id = params?.get('id');
  const applied = useAppSelector(state => (id ? state.appliedJob.byJob[id] : undefined));

  useEffect(() => {
    const init = async () => {
      if (id) {
        setIsLoading(true);
        const res = await callFetchJobById(id);
        if (res?.data) {
          setJobDetail(res.data);
          fetchCompanyDetail();
          window.scrollTo(0, 0);
        }
        setIsLoading(false);
      }
    };
    init();
  }, [id]);
  const fetchCompanyDetail = async () => {
    try {
      const res = await callFetchCompanyById(jobDetail?.company?._id || '');
      if (res?.data) {
        setCompanyDetail(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const handleShareJob = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Copied link to clipboard');
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
              <Row gutter={[20, 20]} align='middle'>
                <Col xs={24} sm={4} md={4} lg={2}>
                  <Avatar
                    src={jobDetail.company?.logo}
                    shape='square'
                    size={90}
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
                    {applied ? (
                      // One application per job: show its status instead of a second apply
                      <Button
                        size='large'
                        icon={<CheckCircleOutlined />}
                        onClick={() => navigate('/my-jobs')}
                        className={styles['btn-applied']}
                      >
                        Applied ·{' '}
                        {RESUME_STATUS[applied.status as ResumeStatus]?.label ?? applied.status}
                      </Button>
                    ) : (
                      <Button
                        type='primary'
                        size='large'
                        icon={<SendOutlined />}
                        onClick={() => setIsModalOpen(true)}
                        className={styles['btn-apply-header']}
                        disabled={jobDetail.isActive === false}
                      >
                        {jobDetail.isActive === false ? 'No longer accepting' : 'Apply now'}
                      </Button>
                    )}
                    <SaveJobButton
                      jobId={jobDetail._id}
                      variant='button'
                      className={styles['btn-save']}
                    />
                    <Button icon={<ShareAltOutlined />} onClick={handleShareJob}>
                      Share
                    </Button>
                    <Button icon={<PrinterOutlined />} onClick={handlePrintJob}>
                      Print
                    </Button>
                    {/* report company */}
                    <Button
                      icon={<WarningOutlined />}
                      onClick={() => {
                        alert('Report');
                      }}
                    >
                      Report this company
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            <Card
              className={styles['job-detail-card']}
              title={<Title level={4}>Job Details</Title>}
              bordered={false}
            >
              {/* Job Overview */}
              <Row gutter={[16, 24]}>
                <Col span={24}>
                  <div className={styles['job-overview']}>
                    {/* Salary */}
                    <div className={styles['overview-item']}>
                      <DollarOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Salary: </Text>
                        <Text strong className={styles['value']}>
                          {(jobDetail.salary + '')?.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} đ
                        </Text>
                      </div>
                    </div>
                    {/* Location */}
                    <div className={styles['overview-item']}>
                      <EnvironmentOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Location: </Text>
                        <Text strong className={styles['value']}>
                          {getLocationName(jobDetail.location)}
                        </Text>
                      </div>
                    </div>
                    {/* Job Type */}
                    <div className={styles['overview-item']}>
                      <ClockCircleOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Job Type: </Text>
                        <Text strong className={styles['value']}>
                          Full Time
                        </Text>
                      </div>
                    </div>
                    <div className={styles['overview-item']}>
                      <TeamOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Level: </Text>
                        <Text strong className={styles['value']}>
                          {jobDetail.level || 'All Levels'}
                        </Text>
                      </div>
                    </div>
                    <div className={styles['overview-item']}>
                      <HistoryOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Posted On: </Text>
                        <Text strong className={styles['value']}>
                          {dayjs(jobDetail.updatedAt).locale('en').fromNow()}
                        </Text>
                      </div>
                    </div>
                    {/* Updated At */}
                    {/* <div className={styles['overview-item']}> 
                      <ClockCircleOutlined className={styles['icon']} />
                      <div>
                        <Text type='secondary'>Updated At: </Text>
                        <Text strong className={styles['value']}>
                          {dayjs(jobDetail.updatedAt).locale('vi').fromNow()}
                        </Text>
                      </div>
                    </div> */}
                  </div>
                </Col>

                <Col span={24}>
                  <div className={styles['skills-section']}>
                    <Title level={5}>
                      <TagsOutlined /> Required Skills
                    </Title>
                    <div className={styles['skills']}>
                      {jobDetail?.skills?.map((item, index) => (
                        <Tag key={`${index}-${item}`} color='blue' className={styles['skill-tag']}>
                          {item}
                        </Tag>
                      ))}
                    </div>
                  </div>
                </Col>

                <Col className={styles['job-description-col']} span={24}>
                  {/* Job Description */}
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
                {/* Avatar */}
                <Avatar
                  src={jobDetail.company?.logo}
                  shape='square'
                  size={90}
                  className={styles['company-logo-lg']}
                />
                {/* Name */}
                <Title level={4} className={styles['company-name']}>
                  {jobDetail.company?.name || 'Unknown Company'}
                </Title>

                <Divider />

                <div className={styles['company-info-item']}>
                  <GlobalOutlined className={styles['icon']} />
                  {companyDetail?.website && (
                    <Text className={styles['value']}>
                      <a
                        href={`https://${companyDetail?.website}` || '#'}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {companyDetail?.website.replace(/(^\w+:|^)\/\//, '')}
                      </a>
                    </Text>
                  )}
                  {!companyDetail?.website && (
                    <Text className={styles['value']}>Unknown Website</Text>
                  )}
                </div>
                {/* Email  */}
                <div className={styles['company-info-item']}>
                  <MailOutlined className={styles['icon']} />
                  <Text className={styles['value']}>{companyDetail?.email || 'Unknown Email'}</Text>
                </div>
                {/* Phone number */}
                <div className={styles['company-info-item']}>
                  <PhoneOutlined className={styles['icon']} />
                  <Text className={styles['value']}>{companyDetail?.phone || 'Unknown Phone'}</Text>
                </div>

                <div className={styles['company-info-item']}>
                  <EnvironmentOutlined className={styles['icon']} />
                  <Text className={styles['value']}>
                    {companyDetail?.address || 'Unknown Address'}
                  </Text>
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
