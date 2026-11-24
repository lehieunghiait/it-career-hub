import { Avatar, Card, Row, Space, Typography } from 'antd';
import { Col } from 'antd';
import styles from 'styles/client.module.scss';

import i18next from 'i18next';

const AboutTeamMember = ({ teamMembers }: { teamMembers: any[] }) => {
  return (
    <section style={{ marginBottom: 40 }}>
      <Typography.Title level={3} style={{ textAlign: 'center' }}>
        {i18next.t('app:components.client.about.about_teammember.our_team')}
      </Typography.Title>
      <Row gutter={[24, 24]} style={{ marginTop: 20 }}>
        {teamMembers.map((member, index) => (
          <Col xs={24} sm={8} key={index}>
            <Card bordered={false} className={styles['about-card']}>
              <Space direction='vertical' align='center' style={{ width: '100%' }}>
                <Avatar size={100} src={member.avatar} />
                <Typography.Title level={4}>{member.name}</Typography.Title>
                <Typography.Text strong>{member.position}</Typography.Text>
                <Typography.Paragraph>{member.description}</Typography.Paragraph>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
};

export default AboutTeamMember;
