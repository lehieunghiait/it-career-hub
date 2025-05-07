import AboutContact from '@/components/client/about/about.contact';
import AboutTeamMember from '@/components/client/about/about.teammember';
import { Typography, Row, Col, Card, Space, Avatar, Divider } from 'antd';
import styles from 'styles/client.module.scss';

// Khai báo component AboutPage
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
      name: 'Nguyễn Văn A',
      position: 'CEO & Founder',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male&i=1',
      description: 'Có hơn 10 năm kinh nghiệm trong lĩnh vực nhân sự và tuyển dụng.',
    },
    {
      name: 'Trần Thị B',
      position: 'CTO',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=female&i=2',
      description:
        'Chuyên gia công nghệ với sự am hiểu sâu rộng về các giải pháp kỹ thuật hiện đại.',
    },
    {
      name: 'Lê Văn C',
      position: 'Marketing Director',
      avatar: 'https://xsgames.co/randomusers/avatar.php?g=male&i=3',
      description: 'Có kinh nghiệm phong phú trong việc xây dựng chiến lược marketing hiệu quả.',
    },
  ];

  // Định nghĩa các giá trị cốt lõi
  const coreValues = [
    {
      title: 'Đổi mới',
      description:
        'Chúng tôi luôn tìm kiếm những phương pháp và giải pháp mới để phục vụ khách hàng tốt hơn.',
    },
    {
      title: 'Chính trực',
      description:
        'Chúng tôi hoạt động với tiêu chuẩn đạo đức cao nhất, luôn minh bạch và trung thực.',
    },
    {
      title: 'Hợp tác',
      description:
        'Chúng tôi tin vào sức mạnh của làm việc nhóm và xây dựng mối quan hệ đối tác bền vững.',
    },
    {
      title: 'Xuất sắc',
      description:
        'Chúng tôi không ngừng phấn đấu để đạt được kết quả tốt nhất trong mọi việc chúng tôi làm.',
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
