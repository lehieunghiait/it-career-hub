import AboutContact from '@/components/client/about/about.contact';
import AboutTeamMember from '@/components/client/about/about.teammember';
import { Typography, Row, Col, Card, Divider } from 'antd';
import styles from 'styles/client.module.scss';

const AboutPage = () => {
  // Khai báo các thông tin về công ty
  const companyInfo = {
    name: 'IT Việt Nam',
    description:
      'Chúng tôi là một công ty tuyển dụng hàng đầu, kết nối ứng viên tài năng với các doanh nghiệp tốt nhất.',
    mission:
      'Sứ mệnh của chúng tôi là tạo ra một nền tảng kết nối hiệu quả giữa nhà tuyển dụng và người tìm việc, góp phần phát triển thị trường lao động.',
    vision:
      'Trở thành nền tảng tuyển dụng hàng đầu, cung cấp giải pháp toàn diện cho thị trường việc làm.',
  };

  // Khai báo thông tin về đội ngũ
  const teamMembers = [
    {
      name: 'Nghia Le',
      position: 'Developer',
      address: 'Thu Duc City, Ho Chi Minh City, Vietnam',
      avatar: 'https://avatars.githubusercontent.com/u/1234567890?v=4',
      description: 'I am a developer with a passion for building web applications.',
    }
  ];

  // Define core values
  const coreValues = [
    {
      title: 'Innovative',
      description:
        'We always seek new methods and solutions to serve customers better.',
    },
    {
      title: 'Honest',
      description:
        'We operate with the highest ethical standards, always transparent and honest.',
    },
    {
      title: 'Collaborative',
      description:
        'We believe in the power of teamwork and building strong partner relationships.',
    },
    {
      title: 'Exceptional',
      description:
        'We never stop striving to achieve the best results in everything we do.',
    },
  ];

  // Render component
  return (
    <div className={styles['container']}>
      <Typography.Title level={2} style={{ textAlign: 'center', marginTop: 30 }}>
        Về Chúng Tôi
      </Typography.Title>

      {/* Phần giới thiệu */}
      <section style={{ marginBottom: 40 }}>
        <Typography.Title level={3}>{companyInfo.name}</Typography.Title>
        <Typography.Paragraph style={{ fontSize: 16 }}>
          {companyInfo.description}
        </Typography.Paragraph>

        <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
          <Col xs={24} sm={12}>
            <Card title='Sứ mệnh' bordered={false} className={styles['about-card']}>
              <Typography.Paragraph>{companyInfo.mission}</Typography.Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card title='Tầm nhìn' bordered={false} className={styles['about-card']}>
              <Typography.Paragraph>{companyInfo.vision}</Typography.Paragraph>
            </Card>
          </Col>
        </Row>
      </section>

      <Divider />

      {/* Phần giá trị cốt lõi */}
      <section style={{ marginBottom: 40 }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          Giá Trị Cốt Lõi
        </Typography.Title>
        <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
          {coreValues.map((value, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card title={value.title} bordered={false} className={styles['about-card']}>
                <Typography.Paragraph>{value.description}</Typography.Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <Divider />

      {/* Phần đội ngũ */}
      <AboutTeamMember teamMembers={teamMembers} />

      <Divider />

      {/* Phần liên hệ */}
      <AboutContact />
    </div>
  );
};

export default AboutPage;
