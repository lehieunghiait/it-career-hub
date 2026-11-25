import AboutContact from '@/components/client/about/about.contact';
import AboutTeamMember from '@/components/client/about/about.teammember';
import { Typography, Row, Col, Card, Divider } from 'antd';
import styles from 'styles/client.module.scss';

import i18next from 'i18next';

const AboutPage = () => {
  // Khai báo các thông tin về công ty
  const companyInfo = {
    name: 'IT Việt Nam',
    description:
      i18next.t('app:pages.about.index.chung_toi_la_mot_cong_ty'),
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
      description: i18next.t('app:pages.about.index.i_am_a_developer_with_a'),
    }
  ];

  // Define core values
  const coreValues = [
    {
      title: i18next.t('app:pages.about.index.innovative'),
      description:
        i18next.t('app:pages.about.index.we_always_seek_new_methods_and'),
    },
    {
      title: i18next.t('app:pages.about.index.honest'),
      description:
        i18next.t('app:pages.about.index.we_operate_with_the_highest_ethical'),
    },
    {
      title: i18next.t('app:pages.about.index.collaborative'),
      description:
        i18next.t('app:pages.about.index.we_believe_in_the_power_of'),
    },
    {
      title: i18next.t('app:pages.about.index.exceptional'),
      description:
        i18next.t('app:pages.about.index.we_never_stop_striving_to_achieve'),
    },
  ];

  // Render component
  return (
    <div className={styles['container']}>
      <Typography.Title level={2} style={{ textAlign: 'center', marginTop: 30 }}>
        {i18next.t('app:pages.about.index.ve_chung_toi')}
      </Typography.Title>

      {/* Phần giới thiệu */}
      <section style={{ marginBottom: 40 }}>
        <Typography.Title level={3}>{companyInfo.name}</Typography.Title>
        <Typography.Paragraph style={{ fontSize: 16 }}>
          {companyInfo.description}
        </Typography.Paragraph>

        <Row gutter={[24, 24]} style={{ marginTop: 30 }}>
          <Col xs={24} sm={12}>
            <Card title={i18next.t('app:pages.about.index.su_menh')} bordered={false} className={styles['about-card']}>
              <Typography.Paragraph>{companyInfo.mission}</Typography.Paragraph>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card title={i18next.t('app:pages.about.index.tam_nhin')} bordered={false} className={styles['about-card']}>
              <Typography.Paragraph>{companyInfo.vision}</Typography.Paragraph>
            </Card>
          </Col>
        </Row>
      </section>

      <Divider />

      {/* Phần giá trị cốt lõi */}
      <section style={{ marginBottom: 40 }}>
        <Typography.Title level={3} style={{ textAlign: 'center' }}>
          {i18next.t('app:pages.about.index.gia_tri_cot_loi')}
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
