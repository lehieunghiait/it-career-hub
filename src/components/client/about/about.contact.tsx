import { Card, Col, Row, Typography } from 'antd';
import styles from 'styles/client.module.scss';

const AboutContact = () => {
  return (
    <section style={{ marginBottom: 40 }}>
      <Typography.Title level={3} style={{ textAlign: 'center' }}>
        Liên Hệ
      </Typography.Title>
      <Card bordered={false} className={styles['about-card']}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Typography.Paragraph>
              <strong>Địa chỉ:</strong> Thành phố Biên Hòa, Tỉnh Đồng Nai
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Email:</strong> lehieunghia2402@gmail.com
            </Typography.Paragraph>
            <Typography.Paragraph>
              <strong>Điện thoại:</strong> +84 399864422 (Vietnam)
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={12}>
            <Typography.Paragraph>
              Chúng tôi luôn sẵn sàng lắng nghe ý kiến và hỗ trợ bạn. Đừng ngần ngại liên hệ với
              chúng tôi qua email, điện thoại hoặc mạng xã hội.
            </Typography.Paragraph>
          </Col>
        </Row>
      </Card>
    </section>
  );
};

export default AboutContact;
